// import { writeFile } from 'fs/promises'
import fs from 'fs-extra'
import { NextRequest, NextResponse } from 'next/server'
import { NextApiRequest, NextApiResponse } from "next";

export const config = {
    runtime: 'edge',
    api: {
        bodyParser: false,
    },
}

export default async function POST(request: NextRequest, response: NextResponse): Promise<Response> {

    // console.log(request)
    // console.log(request.query);
    const data = await request.formData();
    const file: File | null = data.get('file') as unknown as File;
    if (!file) {
        return NextResponse.json({ success: false })
    }

    const bytes = await file.arrayBuffer()
    const buffer = Buffer.from(bytes)

    // With the file data in the buffer, you can do whatever you want with it.
    // For this, we'll just write it to the filesystem in a new location
    const path = `/public/upload/${file.name}`
    console.log(file)
    await fs.writeFile(path, buffer)
    console.log(`open ${path} to see the uploaded file`)

    return NextResponse.json({ success: true })
}
