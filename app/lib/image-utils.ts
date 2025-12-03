/**
 * Preprocesses an image file for better barcode detection.
 * Resizes the image to a maximum dimension while maintaining aspect ratio,
 * and returns a canvas element with the drawn image.
 */
export const preprocessImage = (file: File): Promise<HTMLCanvasElement> => {
    return new Promise((resolve, reject) => {
        const img = new Image()
        const url = URL.createObjectURL(file)

        img.onload = () => {
            URL.revokeObjectURL(url)

            const maxDimension = 1280
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

            const canvas = document.createElement('canvas')
            canvas.width = width
            canvas.height = height
            const ctx = canvas.getContext('2d')

            if (!ctx) {
                reject(new Error('Could not get canvas context'))
                return
            }

            // Draw image to canvas
            ctx.drawImage(img, 0, 0, width, height)

            // Convert to grayscale
            const imageData = ctx.getImageData(0, 0, width, height)
            const data = imageData.data
            for (let i = 0; i < data.length; i += 4) {
                const avg = (data[i] * 0.299 + data[i + 1] * 0.587 + data[i + 2] * 0.114)
                data[i] = avg // red
                data[i + 1] = avg // green
                data[i + 2] = avg // blue
            }
            ctx.putImageData(imageData, 0, 0)

            resolve(canvas)
        }

        img.onerror = (error) => {
            URL.revokeObjectURL(url)
            reject(error)
        }

        img.src = url
    })
}
