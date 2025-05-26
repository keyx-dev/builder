let nodeIdCounter = 0;

export type ChangeType =
  | "appendChild"
  | "removeChild"
  | "insertBefore"
  | "replaceChild"
  | "dataChanged"
  | "childOrderChanged"
  | "descendantChanged";

export type ChangeDetails<TData extends NodeData> =
  | { type: "dataChanged"; key: keyof TData; value: TData[keyof TData] }
  | { type: "appendChild"; child: Node<TData> }
  | { type: "removeChild"; child: Node<TData> }
  | {
      type: "insertBefore";
      newNode: Node<TData>;
      referenceNode: Node<TData> | null;
    }
  | { type: "replaceChild"; newNode: Node<TData>; oldNode: Node<TData> }
  | { type: "childOrderChanged" }
  | {
      type: "descendantChanged";
      originalChangeType: ChangeType;
      changedNode: Node<TData>;
      originalDetails?: ChangeDetails<TData>;
    };

export type NodeChangeListener<TData extends NodeData> = (
  node: Node<TData>,
  type: ChangeType,
  details?: ChangeDetails<TData>
) => void;

export type SerializedNode<T extends NodeData> = T & {
  children?: SerializedNode<T>[];
};

export interface NodeData {
  children?: NodeData[];
  [key: string]: any;
}

export class Node<TData extends NodeData = NodeData> {
  public readonly id: string;
  public data: TData;
  public parent: Node<TData> | null = null;
  public children: Node<TData>[] = [];
  private listeners: NodeChangeListener<TData>[] = [];

  constructor(data: TData) {
    this.id = `node-${nodeIdCounter++}`;
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const { children, ...restData } = data;
    this.data = restData as TData;
  }

  onChange(listener: NodeChangeListener<TData>): () => void {
    this.listeners.push(listener);
    return () => {
      this.listeners = this.listeners.filter((l) => l !== listener);
    };
  }

  private _notifyChange(
    type: ChangeType,
    details?: ChangeDetails<TData>
  ): void {
    this.listeners.forEach((listener) => listener(this, type, details));
    if (this.parent) {
      if (
        type === "descendantChanged" &&
        details?.type === "descendantChanged"
      ) {
        // Eğer bu zaten bir 'descendantChanged' olayıysa ve detayları da öyleyse,
        // orijinal olayı ve değişen düğümü yukarıya doğru aktar.
        this.parent._notifyChange("descendantChanged", {
          type: "descendantChanged",
          originalChangeType: details.originalChangeType, // Orijinal tipi kullan
          changedNode: details.changedNode, // Orijinal değişen düğümü kullan
          originalDetails: details.originalDetails, // Orijinal detayları kullan
        });
      } else if (type !== "descendantChanged") {
        // Eğer bu 'descendantChanged' olmayan bir olaysa, yeni bir 'descendantChanged' olayı oluştur.
        this.parent._notifyChange("descendantChanged", {
          type: "descendantChanged",
          originalChangeType: type,
          changedNode: this,
          originalDetails: details,
        });
      }
      // Eğer type zaten "descendantChanged" ise ve details.type "descendantChanged" değilse
      // (bu durum normalde olmamalı ama bir güvenlik önlemi olarak),
      // bu olayı yukarı yaymıyoruz çünkü zaten bir üst seviyeden gelmiş olabilir
      // ve döngüye girmesini istemeyiz. Ancak yukarıdaki if/else if bu durumu kapsamalı.
    }
  }

  setData<K extends keyof TData>(key: K, value: TData[K]): void {
    if (key === "children") {
      console.warn(
        "Use Node manipulation methods (appendChild, removeChild, etc.) to modify children, not setData."
      );
      return;
    }

    this.data[key] = value;
    this._notifyChange("dataChanged", { type: "dataChanged", key, value });
  }

  get prev(): Node<TData> | null {
    if (!this.parent) return null;
    const index = this.parent.children.indexOf(this);
    return index > 0 ? this.parent.children[index - 1] : null;
  }

  get next(): Node<TData> | null {
    if (!this.parent) return null;
    const index = this.parent.children.indexOf(this);
    return index < this.parent.children.length - 1
      ? this.parent.children[index + 1]
      : null;
  }

  get siblings(): Node<TData>[] {
    if (!this.parent) return [];
    return this.parent.children.filter((child) => child !== this);
  }

  private _detach(): void {
    if (this.parent) {
      const index = this.parent.children.indexOf(this);
      if (index > -1) {
        this.parent.children.splice(index, 1);
      }
      this.parent = null;
    }
  }

  appendChild(childNode: Node<TData>): Node<TData> {
    if (childNode === this) throw new Error("Cannot append a node to itself.");
    if (childNode.parent === this) return childNode;

    childNode._detach();
    childNode.parent = this;
    this.children.push(childNode);
    this._notifyChange("appendChild", {
      type: "appendChild",
      child: childNode,
    });
    return childNode;
  }

  removeChild(childNode: Node<TData>): Node<TData> | null {
    const index = this.children.indexOf(childNode);
    if (index > -1) {
      this.children.splice(index, 1);
      childNode.parent = null;
      this._notifyChange("removeChild", {
        type: "removeChild",
        child: childNode,
      });
      return childNode;
    }
    return null;
  }

  remove(): void {
    this.parent?.removeChild(this);
  }

  insertBefore(
    newNode: Node<TData>,
    referenceNode: Node<TData> | null
  ): Node<TData> {
    if (newNode === this)
      throw new Error(
        "Cannot insert a node relative to itself in this manner."
      );
    if (referenceNode && !this.children.includes(referenceNode)) {
      throw new Error("Reference node is not a child of this node.");
    }
    if (newNode.parent === this) {
      const currentIndex = this.children.indexOf(newNode);
      if (currentIndex > -1) this.children.splice(currentIndex, 1);
    } else {
      newNode._detach();
    }

    newNode.parent = this;

    if (referenceNode === null) {
      this.children.push(newNode);
    } else {
      const index = this.children.indexOf(referenceNode);
      this.children.splice(index, 0, newNode);
    }
    this._notifyChange("insertBefore", {
      type: "insertBefore",
      newNode,
      referenceNode,
    });
    return newNode;
  }

  replaceChild(newNode: Node<TData>, oldNode: Node<TData>): Node<TData> {
    if (newNode === this || oldNode === this)
      throw new Error("Cannot replace a node with itself or replace self.");
    if (!this.children.includes(oldNode)) {
      throw new Error("Old node is not a child of this node.");
    }

    newNode._detach();
    oldNode.parent = null;

    const index = this.children.indexOf(oldNode);
    this.children[index] = newNode;
    newNode.parent = this;

    this._notifyChange("replaceChild", {
      type: "replaceChild",
      newNode,
      oldNode,
    });
    return oldNode;
  }

  before(newNode: Node<TData>): void {
    if (!this.parent) {
      throw new Error("Node has no parent to insert before.");
    }
    this.parent.insertBefore(newNode, this);
    // Calling insertBefore already triggers a notification on the parent.
    // If a separate 'childOrderChanged' event is desired, the parent should manage that logic.
    // For now, the insertBefore notification is considered sufficient.
  }

  after(newNode: Node<TData>): void {
    if (!this.parent) {
      throw new Error("Node has no parent to insert after.");
    }
    this.parent.insertBefore(newNode, this.next as Node<TData> | null);
  }

  clone(deep: boolean = false): Node<TData> {
    const clonedData = structuredClone(this.data) as TData;
    const clonedNode = new Node<TData>(clonedData);

    if (deep) {
      this.children.forEach((child) => {
        const clonedChild = child.clone(true);
        clonedNode.appendChild(clonedChild);
      });
    }
    return clonedNode;
  }

  toJSON(): SerializedNode<TData> {
    const dataCopy = { ...this.data };

    const serialized: SerializedNode<TData> = dataCopy as SerializedNode<TData>;

    if (this.children.length > 0) {
      serialized.children = this.children.map((child) => child.toJSON());
    } else {
      delete (serialized as any).children;
    }

    return serialized;
  }
}
