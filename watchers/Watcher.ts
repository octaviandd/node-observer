
import { Request, Response } from "express";

interface Watcher {
  type: string;
  getIndex(req: Request, res: Response): Promise<Response>;
  getView(req: Request, res: Response): Promise<Response>;
  addContent(content: unknown): void;
}

export default Watcher;