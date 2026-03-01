import { z } from "zod";
import type { UIMessage } from "ai";

export type DataPart = { type: "append-message"; message: string };

export const messageMetadataSchema = z.object({
  createdAt: z.string(),
  attachments: z.array(z.any()).optional(),
});

export type MessageMetadata = z.infer<typeof messageMetadataSchema>;

export type CustomUIDataTypes = {
  appendMessage: string;
};

export type ChatMessage = UIMessage<MessageMetadata, CustomUIDataTypes>;

export interface Attachment {
  name: string;
  url: string;
  contentType: string;
}
