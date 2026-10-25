import { NextResponse } from "next/server";
import { cloudinary } from "@/lib/cloudinary";

export async function POST(request: Request) {
  try {
    const { file, folder } = await request.json();
    if (!file) {
      return NextResponse.json({ error: "file is required" }, { status: 400 });
    }
    const result = await cloudinary.uploader.upload(file, {
      folder: folder || "shecan",
      resource_type: "auto",
    });
    return NextResponse.json({
      url: result.secure_url,
      publicId: result.public_id,
      width: result.width,
      height: result.height,
    });
  } catch (error) {
    console.error("Cloudinary upload failed", error);
    return NextResponse.json({ error: "Upload failed" }, { status: 500 });
  }
}
