'use client'

import { BrowserMultiFormatReader, BarcodeFormat } from '@zxing/browser'
import { useFormState, useFormStatus } from 'react-dom'
import { updateCard } from '@/app/lib/actions'
import { useState, useRef } from 'react'
import { useZxing } from 'react-zxing'

import LogoPicker from '@/components/logo-picker'

export default function EditCardForm({ card, nerdMode }: { card: any; nerdMode: boolean }) {
    const updateCardWithId = updateCard.bind(null, card.id)
    const [errorMessage, dispatch] = useFormState(updateCardWithId, undefined)
    const [scannedResult, setScannedResult] = useState(card.barcodeValue || '')
    const [detectedFormat, setDetectedFormat] = useState(card.barcodeFormat || 'code128')
    const [isScanning, setIsScanning] = useState(false)
    const [imagePreview, setImagePreview] = useState<string | null>(null)
    const [scanStatus, setScanStatus] = useState<'idle' | 'scanning' | 'success' | 'error'>('idle')
    const [retailerName, setRetailerName] = useState(card.retailer || '')
    const [selectedLogo, setSelectedLogo] = useState<string | null>(card.logo || null)
    const [isLogoPickerOpen, setIsLogoPickerOpen] = useState(false)
    const fileInputRef = useRef<HTMLInputElement>(null)

    const { ref } = useZxing({
        onResult(result) {
            setScannedResult(result.getText())
            setDetectedFormat(mapBarcodeFormat(result.getBarcodeFormat()))
            setIsScanning(false)
        },
        paused: !isScanning,
    })

    // Map ZXing format to our format strings
    const mapBarcodeFormat = (format: BarcodeFormat): string => {
        const formatMap: Record<number, string> = {
            [BarcodeFormat.CODE_128]: 'code128',
            [BarcodeFormat.EAN_13]: 'ean13',
            [BarcodeFormat.UPC_A]: 'upca',
            [BarcodeFormat.QR_CODE]: 'qrcode',
            [BarcodeFormat.PDF_417]: 'pdf417',
            [BarcodeFormat.DATA_MATRIX]: 'datamatrix',
            [BarcodeFormat.AZTEC]: 'aztec',
            [BarcodeFormat.CODE_39]: 'code39',
        }
        return formatMap[format] || 'code128'
    }

    // Helper to create image element from file
    const createImageElement = (file: File): Promise<HTMLImageElement> => {
        return new Promise((resolve, reject) => {
            const img = new Image()
            const url = URL.createObjectURL(file)
            img.onload = () => {
                URL.revokeObjectURL(url)
                resolve(img)
            }
            img.onerror = reject
            img.src = url
        })
    }

    // Handle image upload and barcode scanning
    const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0]
        if (!file) return

        // Show preview
        const reader = new FileReader()
        reader.onload = (event) => {
            setImagePreview(event.target?.result as string)
        }
        reader.readAsDataURL(file)

        // Scan for barcode
        setScanStatus('scanning')
        try {
            const codeReader = new BrowserMultiFormatReader()
            const result = await codeReader.decodeFromImageElement(
                await createImageElement(file)
            )

            // Success! Found a barcode
            setScannedResult(result.getText())
            setDetectedFormat(mapBarcodeFormat(result.getBarcodeFormat()))
            setScanStatus('success')
        } catch (error) {
            console.error('Barcode detection failed:', error)
            setScanStatus('error')
            // User can still manually enter barcode
        }
    }

    return (
        <>
            <form action={dispatch} className="space-y-6">
                <div>
                    <div className="flex items-center justify-between">
                        <label htmlFor="retailer" className="block text-sm font-medium text-gray-700">
                            Retailer Name *
                        </label>
                        <LogoPicker
                            searchTerm={retailerName}
                            onSelect={setSelectedLogo}
                            initialLogo={selectedLogo}
                            isOpen={isLogoPickerOpen}
                            onOpenChange={setIsLogoPickerOpen}
                        />
                    </div>
                    <input
                        type="text"
                        name="retailer"
                        id="retailer"
                        required
                        value={retailerName}
                        onChange={(e) => setRetailerName(e.target.value)}
                        className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 shadow-sm focus:border-indigo-500 focus:outline-none focus:ring-indigo-500 sm:text-sm"
                        placeholder="e.g. Starbucks"
                    />
                    <input type="hidden" name="logo" value={selectedLogo || ''} />
                </div>

                <div>
                    <label htmlFor="barcodeValue" className="block text-sm font-medium text-gray-700">
                        Barcode Number
                    </label>
                    <input
                        type="text"
                        name="barcodeValue"
                        id="barcodeValue"
                        value={scannedResult}
                        onChange={(e) => setScannedResult(e.target.value)}
                        className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 shadow-sm focus:border-indigo-500 focus:outline-none focus:ring-indigo-500 sm:text-sm"
                    />
                </div>

                {nerdMode && (
                    <div>
                        <label htmlFor="barcodeFormat" className="block text-sm font-medium text-gray-700">
                            Barcode Format
                        </label>
                        <select
                            name="barcodeFormat"
                            id="barcodeFormat"
                            value={detectedFormat}
                            onChange={(e) => setDetectedFormat(e.target.value)}
                            className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 shadow-sm focus:border-indigo-500 focus:outline-none focus:ring-indigo-500 sm:text-sm"
                        >
                            <option value="code128">Code 128</option>
                            <option value="ean13">EAN-13</option>
                            <option value="upca">UPC-A</option>
                            <option value="qrcode">QR Code</option>
                            <option value="pdf417">PDF417</option>
                            <option value="datamatrix">Data Matrix</option>
                            <option value="aztec">Aztec</option>
                            <option value="code39">Code 39</option>
                        </select>
                    </div>
                )}

                {/* Hidden input to always submit the format */}
                {!nerdMode && (
                    <input type="hidden" name="barcodeFormat" value={detectedFormat} />
                )}

                <div>
                    <label htmlFor="note" className="block text-sm font-medium text-gray-700">
                        Note (Optional)
                    </label>
                    <textarea
                        name="note"
                        id="note"
                        rows={3}
                        defaultValue={card.note || ''}
                        className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 shadow-sm focus:border-indigo-500 focus:outline-none focus:ring-indigo-500 sm:text-sm"
                    />
                </div>

                <div>
                    <label htmlFor="image" className="block text-sm font-medium text-gray-700">
                        Card Image (Optional)
                    </label>
                    {card.image && !imagePreview && (
                        <div className="mb-2">
                            <img src={card.image} alt="Current card" className="h-20 object-contain" />
                            <p className="text-xs text-gray-500">Current image</p>
                        </div>
                    )}
                    <input
                        type="file"
                        name="image"
                        id="image"
                        accept="image/*"
                        className="mt-1 block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-md file:border-0 file:text-sm file:font-semibold file:bg-indigo-50 file:text-indigo-700 hover:file:bg-indigo-100"
                    />
                </div>

                <div>
                    <SubmitButton />
                </div>
                <div className="flex h-8 items-end space-x-1" aria-live="polite" aria-atomic="true">
                    {errorMessage && <p className="text-sm text-red-500">{errorMessage}</p>}
                </div>
            </form>
        </>
    )
}

function SubmitButton() {
    const { pending } = useFormStatus()

    return (
        <button
            type="submit"
            disabled={pending}
            className="flex w-full justify-center rounded-md border border-transparent bg-indigo-600 px-4 py-2 text-sm font-medium text-white shadow-sm hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 disabled:bg-gray-400"
        >
            {pending ? 'Saving...' : 'Save Changes'}
        </button>
    )
}
