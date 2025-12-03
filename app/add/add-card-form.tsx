'use client'

import { BrowserMultiFormatReader, BarcodeFormat } from '@zxing/browser'
import { useFormState, useFormStatus } from 'react-dom'
import { createCard } from '@/app/lib/actions'
import { useState, useRef } from 'react'
import Link from 'next/link'
import { useZxing } from 'react-zxing'

import LogoPicker from '@/components/logo-picker'

export default function AddCardForm({ nerdMode }: { nerdMode: boolean }) {
    const [errorMessage, dispatch] = useFormState(createCard, undefined)
    const [scannedResult, setScannedResult] = useState('')
    const [detectedFormat, setDetectedFormat] = useState('code128')
    const [isScanning, setIsScanning] = useState(false)
    const [imagePreview, setImagePreview] = useState<string | null>(null)
    const [scanStatus, setScanStatus] = useState<'idle' | 'scanning' | 'success' | 'error'>('idle')
    const [retailerName, setRetailerName] = useState('')
    const [selectedLogo, setSelectedLogo] = useState<string | null>(null)
    const [isLogoPickerOpen, setIsLogoPickerOpen] = useState(false)
    const fileInputRef = useRef<HTMLInputElement>(null)
    const imageFileInputRef = useRef<HTMLInputElement>(null)

    const { ref } = useZxing({
        onResult(result) {
            setScannedResult(result.getText())
            setDetectedFormat(mapBarcodeFormat(result.getBarcodeFormat()))
            setIsScanning(false)
        },
        paused: !isScanning,
    })

    // Auto-open logo picker when retailer name is entered and blurred
    const handleRetailerBlur = () => {
        if (retailerName && !selectedLogo) {
            setIsLogoPickerOpen(true)
        }
    }

    // ... (rest of the file)

    return (
        // ...
        <form action={dispatch} className="space-y-6">
            <div>
                <div className="flex items-center justify-between">
                    <label htmlFor="retailer" className="block text-sm font-medium text-gray-700">
                        Retailer Name *
                    </label>
                    <LogoPicker
                        searchTerm={retailerName}
                        onSelect={setSelectedLogo}
                        initialLogo={null}
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
                    onBlur={handleRetailerBlur}
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
                    placeholder="Scanned or manually entered"
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
                    className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 shadow-sm focus:border-indigo-500 focus:outline-none focus:ring-indigo-500 sm:text-sm"
                />
            </div>

            <div>
                <label htmlFor="image" className="block text-sm font-medium text-gray-700">
                    Card Image (Optional)
                </label>
                <p className="text-xs text-gray-500 mt-1 mb-2">
                    {imagePreview ? 'Image already uploaded above. Select a different file to replace it.' : 'Upload a photo of your card'}
                </p>
                <input
                    ref={imageFileInputRef}
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
            </div >
        </div >
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
            {pending ? 'Saving...' : 'Save Card'}
        </button>
    )
}
