import {
  S3Client,
  PutObjectCommand,
  DeleteObjectCommand,
} from "@aws-sdk/client-s3";

function env(key: string): string | undefined {
  // Indirect reference: store process.env in a variable first so webpack
  // cannot statically analyze or replace the property access.
  const runtimeEnv: Record<string, string | undefined> = (globalThis as any)[
    "process"
  ]["env"];
  return runtimeEnv[key];
}

// Environment variables (lazy validation - only checked at runtime)
function getSpacesConfig() {
  const SPACES_ENDPOINT = env("SPACES_ENDPOINT");
  const SPACES_ACCESS_KEY = env("SPACES_ACCESS_KEY");
  const SPACES_SECRET_KEY = env("SPACES_SECRET_KEY");
  const SPACES_BUCKET = env("SPACES_BUCKET");
  const SPACES_REGION = env("SPACES_REGION") || "nyc3";
  const SPACES_FOLDER_PREFIX = env("SPACES_FOLDER_PREFIX") || "";

  // Runtime diagnostic logging
  console.log("[Spaces Config] Runtime env check:", {
    SPACES_ENDPOINT: !!SPACES_ENDPOINT,
    SPACES_ACCESS_KEY: !!SPACES_ACCESS_KEY,
    SPACES_SECRET_KEY: !!SPACES_SECRET_KEY,
    SPACES_BUCKET: !!SPACES_BUCKET,
    SPACES_REGION: !!SPACES_REGION,
    envType: typeof process.env,
    spacesKeysInEnv: Object.keys(process.env).filter((k) =>
      k.startsWith("SPACES_"),
    ),
  });

  if (
    !SPACES_ENDPOINT ||
    !SPACES_ACCESS_KEY ||
    !SPACES_SECRET_KEY ||
    !SPACES_BUCKET
  ) {
    throw new Error(
      "Missing required Spaces environment variables: SPACES_ENDPOINT, SPACES_ACCESS_KEY, SPACES_SECRET_KEY, SPACES_BUCKET",
    );
  }

  return {
    endpoint: SPACES_ENDPOINT,
    accessKey: SPACES_ACCESS_KEY,
    secretKey: SPACES_SECRET_KEY,
    bucket: SPACES_BUCKET,
    region: SPACES_REGION,
    folderPrefix: SPACES_FOLDER_PREFIX,
  };
}

// Lazy initialization of S3 client (only when needed, after env vars are available)
let s3Client: S3Client | null = null;

function getS3Client(): S3Client {
  if (!s3Client) {
    const config = getSpacesConfig();
    s3Client = new S3Client({
      endpoint: `https://${config.endpoint}`,
      region: config.region,
      credentials: {
        accessKeyId: config.accessKey,
        secretAccessKey: config.secretKey,
      },
      forcePathStyle: false, // DigitalOcean Spaces uses virtual-hosted-style URLs
    });
  }
  return s3Client;
}

/**
 * Upload a file to DigitalOcean Spaces
 * @param fileBuffer - The file buffer to upload
 * @param filename - The filename (will be prefixed with folder/subfolder if set)
 * @param contentType - MIME type of the file
 * @param subfolder - Optional subfolder (e.g., "images" or "files") for organizing uploads
 * @returns The public CDN URL of the uploaded file
 */
export async function uploadFile(
  fileBuffer: Buffer,
  filename: string,
  contentType: string,
  subfolder?: string,
): Promise<string> {
  const config = getSpacesConfig();
  const client = getS3Client();

  // Build key: [folderPrefix/][subfolder/]filename
  const parts = [config.folderPrefix, subfolder, filename].filter(Boolean);
  const key = parts.join("/");

  const command = new PutObjectCommand({
    Bucket: config.bucket,
    Key: key,
    Body: fileBuffer,
    ContentType: contentType,
    ACL: "public-read", // Make file publicly accessible
  });

  await client.send(command);

  // Construct CDN URL
  const cdnUrl =
    env("SPACES_CDN_URL") ||
    `https://${config.bucket}.${config.region}.cdn.digitaloceanspaces.com`;
  const fileUrl = `${cdnUrl}/${key}`;

  return fileUrl;
}

/**
 * Delete a file from DigitalOcean Spaces
 * @param filename - The storage key (e.g. "images/xyz.jpg", "files/resume.pdf", or plain filename for legacy)
 * @returns void
 */
export async function deleteFile(filename: string): Promise<void> {
  const config = getSpacesConfig();
  const client = getS3Client();

  // Ensure folder prefix is included if set
  const key = config.folderPrefix
    ? filename.startsWith(`${config.folderPrefix}/`)
      ? filename
      : `${config.folderPrefix}/${filename}`
    : filename;

  const command = new DeleteObjectCommand({
    Bucket: config.bucket,
    Key: key,
  });

  await client.send(command);
}

/**
 * Get the configured bucket name
 */
export function getBucketName(): string {
  return getSpacesConfig().bucket;
}

/**
 * Get the configured folder prefix
 */
export function getFolderPrefix(): string {
  return getSpacesConfig().folderPrefix;
}
