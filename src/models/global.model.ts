export module Models {
  export interface Env {
    prod: boolean;
  }
  export interface Todo {
    id?: string;
    text: string;
  }
}
