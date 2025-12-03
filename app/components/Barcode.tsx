'use client'

import { useEffect, useRef } from 'react'
import bwipjs from 'bwip-js'

export default function Barcode({ value, format }: { value: string; format: string }) {
    const canvasRef = useRef<HTMLCanvasElement>(null)

    useEffect(() => {
        if (canvasRef.current && value && format) {
            try {
                bwipjs.toCanvas(canvasRef.current, {
                    bcid: format,       // Barcode type
                    text: value,        // Text to encode
                    scale: 3,           // 3x scaling factor
                    height: 10,         // Bar height, in millimeters
                    includetext: false, // We display text separately below
                    textxalign: 'center', // Always good to set this
                })
            } catch (e) {
                console.error(e)
            }
        }
    }, [value, format])

    return <canvas ref={canvasRef} className="max-w-full" />
}
