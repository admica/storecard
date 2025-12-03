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
    return (
        <>
            {/* Scanning Options */}
            <div className="mb-6 space-y-3">
                {isScanning ? (
                    <div>
                        <div className="relative aspect-video w-full overflow-hidden rounded-lg bg-black">
                            <video ref={ref} className="h-full w-full object-cover" />
                            <button
                                type="button"
                                onClick={() => setIsScanning(false)}
                                className="absolute top-2 right-2 rounded-full bg-white/80 p-2 text-gray-800 hover:bg-white"
                            >
                                Close
                            </button>
                        </div>
                        <p className="mt-2 text-center text-sm text-gray-500">Point camera at barcode</p>
                    </div>
                ) : (
                    <>
                        <button
                            type="button"
                            onClick={() => setIsScanning(true)}
                            className="flex w-full items-center justify-center rounded-md border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 shadow-sm hover:bg-gray-50"
                        >
                            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="mr-2 h-5 w-5">
                                <path strokeLinecap="round" strokeLinejoin="round" d="M3.75 4.875c0-.621.504-1.125 1.125-1.125h4.5c.621 0 1.125.504 1.125 1.125v4.5c0 .621-.504 1.125-1.125 1.125h-4.5A1.125 1.125 0 013.75 9.375v-4.5zM3.75 14.625c0-.621.504-1.125 1.125-1.125h4.5c.621 0 1.125.504 1.125 1.125v4.5c0 .621-.504 1.125-1.125 1.125h-4.5a1.125 1.125 0 01-1.125-1.125v-4.5zM13.5 4.875c0-.621.504-1.125 1.125-1.125h4.5c.621 0 1.125.504 1.125 1.125v4.5c0 .621-.504 1.125-1.125 1.125h-4.5A1.125 1.125 0 0113.5 9.375v-4.5z" />
                                <path strokeLinecap="round" strokeLinejoin="round" d="M6.75 6.75h.75v.75h-.75v-.75zM6.75 16.5h.75v.75h-.75v-.75zM16.5 6.75h.75v.75h-.75v-.75zM13.5 13.5h.75v.75h-.75v-.75zM13.5 19.5h.75v.75h-.75v-.75zM19.5 13.5h.75v.75h-.75v-.75zM19.5 19.5h.75v.75h-.75v-.75zM16.5 16.5h.75v.75h-.75v-.75z" />
                            </svg>
                            Scan with Camera
                        </button>

                        <button
                            type="button"
                            onClick={() => fileInputRef.current?.click()}
                            className="flex w-full items-center justify-center rounded-md border-2 border-dashed border-gray-300 bg-white px-4 py-3 text-sm font-medium text-gray-700 shadow-sm hover:border-indigo-400 hover:bg-gray-50"
                        >
                            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="mr-2 h-5 w-5">
                                <path strokeLinecap="round" strokeLinejoin="round" d="M3 16.5v2.25A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75V16.5m-13.5-9L12 3m0 0l4.5 4.5M12 3v13.5" />
                            </svg>
                            Upload Photo to Scan Barcode
                        </button>
                        <input
                            ref={fileInputRef}
                            type="file"
                            accept="image/*"
                            onChange={handleImageUpload}
                            className="hidden"
                        />
                    </>
                )}
            </div>

            {/* Scan Status Messages */}
            {scanStatus === 'scanning' && (
                <div className="mb-4 p-3 bg-blue-50 border border-blue-200 rounded-md flex items-center">
                    <svg className="animate-spin h-5 w-5 mr-2 text-blue-600" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    <p className="text-sm text-blue-700">Scanning image for barcode...</p>
                </div>
            )}

            {scanStatus === 'success' && (
                <div className="mb-4 p-3 bg-green-50 border border-green-200 rounded-md">
                    <p className="text-sm text-green-700">✅ Barcode detected! Fields auto-filled.</p>
                </div>
            )}

            {scanStatus === 'error' && (
                <div className="mb-4 p-3 bg-yellow-50 border border-yellow-200 rounded-md">
                    <p className="text-sm text-yellow-700">⚠️ No barcode found in image. You can still enter it manually.</p>
                </div>
            )}

            {/* Image Preview */}
            {imagePreview && (
                <div className="mb-4">
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                        Uploaded Image Preview
                    </label>
                    <img
                        src={imagePreview}
                        alt="Card preview"
                        className="w-full max-h-48 object-contain rounded-lg border border-gray-200"
                    />
                </div>
            )}

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
