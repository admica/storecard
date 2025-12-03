/**
 * Preprocesses an image file for better barcode detection.
 * Resizes the image to a maximum dimension while maintaining aspect ratio,
 * applies contrast enhancement, and returns a canvas element with the drawn image.
 * 
 * Note: We don't convert to grayscale here - the @zxing library handles
 * luminance conversion internally with its own optimized algorithm.
 */
export const preprocessImage = (file: File): Promise<HTMLCanvasElement> => {
    return new Promise((resolve, reject) => {
        const img = new Image()
        const url = URL.createObjectURL(file)

        img.onload = () => {
            URL.revokeObjectURL(url)

            const maxDimension = 1280
            const minDimension = 800 // Upscale very small images for better detection
            let width = img.width
            let height = img.height

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
            const maxOriginalDim = Math.max(img.width, img.height)
            if (maxOriginalDim < minDimension) {
                const scale = minDimension / maxOriginalDim
                width = Math.round(width * scale)
                height = Math.round(height * scale)
            }

            const canvas = document.createElement('canvas')
            canvas.width = width
            canvas.height = height
            // Use willReadFrequently for better performance when getImageData is called
            const ctx = canvas.getContext('2d', { willReadFrequently: true })

            if (!ctx) {
                reject(new Error('Could not get canvas context'))
                return
            }

            // Draw image to canvas
            ctx.drawImage(img, 0, 0, width, height)
            
            // Apply contrast enhancement to make barcodes more distinct
            try {
                const imageData = ctx.getImageData(0, 0, width, height)
                const data = imageData.data
                
                // Find min/max luminance for contrast stretching
                let minLum = 255, maxLum = 0
                for (let i = 0; i < data.length; i += 4) {
                    // Calculate luminance (weighted average)
                    const lum = 0.299 * data[i] + 0.587 * data[i + 1] + 0.114 * data[i + 2]
                    minLum = Math.min(minLum, lum)
                    maxLum = Math.max(maxLum, lum)
                }
                
                // Apply contrast stretching if there's a reasonable range
                const range = maxLum - minLum
                if (range > 30) { // Only adjust if there's meaningful contrast
                    const factor = 255 / range
                    for (let i = 0; i < data.length; i += 4) {
                        data[i] = Math.min(255, Math.max(0, (data[i] - minLum) * factor))
                        data[i + 1] = Math.min(255, Math.max(0, (data[i + 1] - minLum) * factor))
                        data[i + 2] = Math.min(255, Math.max(0, (data[i + 2] - minLum) * factor))
                    }
                    ctx.putImageData(imageData, 0, 0)
                }
            } catch (e) {
                // If contrast enhancement fails, continue with original image
                console.warn('Contrast enhancement failed:', e)
            }

            resolve(canvas)
        }

        img.onerror = (error) => {
            URL.revokeObjectURL(url)
            reject(error)
        }

        img.src = url
    })
}
