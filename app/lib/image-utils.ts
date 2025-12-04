/**
 * Preprocesses an image file for better barcode detection.
 * 
 * Key features:
 * - Handles EXIF orientation (critical for mobile phone photos!)
 * - Resizes to optimal dimensions for barcode detection
 * - Applies contrast enhancement
 * 
 * Note: We don't convert to grayscale - the @zxing library handles
 * luminance conversion internally with its own optimized algorithm.
 */
export const preprocessImage = async (file: File): Promise<HTMLCanvasElement> => {
    const maxDimension = 1280
    const minDimension = 800

    // Use createImageBitmap with imageOrientation to properly handle EXIF rotation
    // This is critical for mobile photos which often have EXIF orientation metadata
    let bitmap: ImageBitmap
    try {
        // Try with imageOrientation option (handles EXIF rotation)
        bitmap = await createImageBitmap(file, {
            imageOrientation: 'from-image', // Apply EXIF orientation
            premultiplyAlpha: 'none',
        })
    } catch {
        // Fallback for browsers that don't support the options
        console.warn('createImageBitmap with options not supported, falling back')
        bitmap = await createImageBitmap(file)
    }

    let width = bitmap.width
    let height = bitmap.height

    // Calculate new dimensions if image is too large
    if (width > maxDimension || height > maxDimension) {
        if (width > height) {
            height = Math.round((height * maxDimension) / width)
            width = maxDimension
        } else {
            width = Math.round((width * maxDimension) / height)
            height = maxDimension
        }
    }

    // Upscale very small images for better barcode detection
    const maxOriginalDim = Math.max(bitmap.width, bitmap.height)
    if (maxOriginalDim < minDimension) {
        const scale = minDimension / maxOriginalDim
        width = Math.round(width * scale)
        height = Math.round(height * scale)
    }

    const canvas = document.createElement('canvas')
    canvas.width = width
    canvas.height = height
    const ctx = canvas.getContext('2d', { willReadFrequently: true })

    if (!ctx) {
        bitmap.close()
        throw new Error('Could not get canvas context')
    }

    // Draw image to canvas (now correctly oriented thanks to createImageBitmap)
    ctx.drawImage(bitmap, 0, 0, width, height)
    bitmap.close() // Free up memory

    // Apply contrast enhancement to make barcodes more distinct
    try {
        const imageData = ctx.getImageData(0, 0, width, height)
        const data = imageData.data

        // Find min/max luminance for contrast stretching
        let minLum = 255, maxLum = 0
        for (let i = 0; i < data.length; i += 4) {
            const lum = 0.299 * data[i] + 0.587 * data[i + 1] + 0.114 * data[i + 2]
            minLum = Math.min(minLum, lum)
            maxLum = Math.max(maxLum, lum)
        }

        // Apply contrast stretching if there's a reasonable range
        const range = maxLum - minLum
        if (range > 30) {
            const factor = 255 / range
            for (let i = 0; i < data.length; i += 4) {
                data[i] = Math.min(255, Math.max(0, (data[i] - minLum) * factor))
                data[i + 1] = Math.min(255, Math.max(0, (data[i + 1] - minLum) * factor))
                data[i + 2] = Math.min(255, Math.max(0, (data[i + 2] - minLum) * factor))
            }
            ctx.putImageData(imageData, 0, 0)
        }
    } catch (e) {
        console.warn('Contrast enhancement failed:', e)
    }

    return canvas
}

/**
 * Creates a rotated version of a canvas for multi-orientation barcode scanning.
 * Returns canvases rotated at 0°, 90°, 180°, and 270°.
 */
export const getRotatedCanvases = (canvas: HTMLCanvasElement): HTMLCanvasElement[] => {
    const results: HTMLCanvasElement[] = [canvas] // 0° is the original
    const ctx = canvas.getContext('2d')
    if (!ctx) return results

    const rotations = [90, 180, 270] // degrees

    for (const degrees of rotations) {
        const radians = (degrees * Math.PI) / 180
        const rotatedCanvas = document.createElement('canvas')

        // For 90° and 270°, swap width and height
        if (degrees === 90 || degrees === 270) {
            rotatedCanvas.width = canvas.height
            rotatedCanvas.height = canvas.width
        } else {
            rotatedCanvas.width = canvas.width
            rotatedCanvas.height = canvas.height
        }

        const rotatedCtx = rotatedCanvas.getContext('2d', { willReadFrequently: true })
        if (!rotatedCtx) continue

        rotatedCtx.translate(rotatedCanvas.width / 2, rotatedCanvas.height / 2)
        rotatedCtx.rotate(radians)
        rotatedCtx.drawImage(canvas, -canvas.width / 2, -canvas.height / 2)

        results.push(rotatedCanvas)
    }

    return results
}
