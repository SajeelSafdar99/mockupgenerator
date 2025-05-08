"use client"

import type React from "react"

import { useState, useRef, useEffect } from "react"
import { useSearchParams } from "next/navigation"
import Image from "next/image"
import { Button } from "@/components/ui/button"
import { Slider } from "@/components/ui/slider"
import {
  Download,
  Upload,
  Move,
  RotateCcw,
  ZoomIn,
  Layers,
  PanelLeft,
  PanelRight,
  ImageIcon,
  Trash2,
  SunMedium,
  Contrast,
  Palette,
  Sparkles,
} from "lucide-react"
import { useIsMobile as useMobile } from "@/hooks/use-mobile"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"

// Define logo data structure
interface LogoData {
  id: string
  file: File | null
  url: string | null
  position: { x: number; y: number }
  size: number
  rotation: number
  filters: {
    brightness: number
    contrast: number
    hue: number
    saturation: number
  }
}

// Define template data structure
export interface TemplateData {
  id: string
  name: string
  image: string
}

export default function EditorPage() {
  const searchParams = useSearchParams()
  const initialTemplate = searchParams.get("template") || "box"
  const [selectedTemplate, setSelectedTemplate] = useState(initialTemplate)
  const [logos, setLogos] = useState<LogoData[]>([])
  const [selectedLogoIndex, setSelectedLogoIndex] = useState<number | null>(null)
  const [isDragging, setIsDragging] = useState(false)
  const [dragOffset, setDragOffset] = useState({ x: 0, y: 0 })
  const [templateColor, setTemplateColor] = useState("#FFFFFF")
  const [showLeftPanel, setShowLeftPanel] = useState(true)
  const [showRightPanel, setShowRightPanel] = useState(true)
  const [activeTab, setActiveTab] = useState("logo")
  const [aiPrompt, setAiPrompt] = useState("")
  const [isGenerating, setIsGenerating] = useState(false)
  const [generatedLogos, setGeneratedLogos] = useState<string[]>([])
  const containerRef = useRef<HTMLDivElement>(null)
  const isMobile = useMobile()

  // Template data mapping
  const templateImages: Record<string, string> = {
    box: "/product-box.png??key=lkdoe",
    cup: "/cup.png?key=7tclj",
    bag: "/bag.jpg?key=yfvyb",
    container: "/food-container.webp?key=pbzx5",
  }

  const templateNames: Record<string, string> = {
    box: "Product Box",
    cup: "Coffee Cup",
    bag: "Shopping Bag",
    container: "Food Container",
  }

  // Get the currently selected logo
  const selectedLogo = selectedLogoIndex !== null ? logos[selectedLogoIndex] : null

  // Create a new logo
  const createNewLogo = (file: File | null = null, url: string | null = null): LogoData => {
    return {
      id: Date.now().toString(),
      file,
      url,
      position: { x: 50, y: 50 },
      size: 30,
      rotation: 0,
      filters: {
        brightness: 100,
        contrast: 100,
        hue: 0,
        saturation: 100,
      },
    }
  }

  // Add a new logo
  const addLogo = (file: File | null = null, url: string | null = null) => {
    const newLogo = createNewLogo(file, url)
    setLogos([...logos, newLogo])
    setSelectedLogoIndex(logos.length)
  }

  // Remove the selected logo
  const removeLogo = () => {
    if (selectedLogoIndex === null) return

    const newLogos = [...logos]
    newLogos.splice(selectedLogoIndex, 1)
    setLogos(newLogos)
    setSelectedLogoIndex(newLogos.length > 0 ? 0 : null)
  }

  // Update logo URL when file changes
  useEffect(() => {
    logos.forEach((logo, index) => {
      if (logo.file && !logo.url) {
        const url = URL.createObjectURL(logo.file)
        const updatedLogos = [...logos]
        updatedLogos[index] = { ...logo, url }
        setLogos(updatedLogos)
      }
    })

    // Cleanup URLs when component unmounts
    return () => {
      logos.forEach((logo) => {
        if (logo.url && logo.url.startsWith("blob:")) {
          URL.revokeObjectURL(logo.url)
        }
      })
    }
  }, [logos])

  // Handle file upload
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      addLogo(e.target.files[0], null)
    }
  }

  // Handle drag start for logo positioning
  const handleDragStart = (e: React.MouseEvent | React.TouchEvent, logoIndex: number) => {
    setSelectedLogoIndex(logoIndex)
    setIsDragging(true)

    let clientX: number, clientY: number

    if ("touches" in e) {
      clientX = e.touches[0].clientX
      clientY = e.touches[0].clientY
    } else {
      clientX = e.clientX
      clientY = e.clientY
    }

    const rect = containerRef.current?.getBoundingClientRect()
    if (rect) {
      const logo = logos[logoIndex]
      const offsetX = clientX - rect.left - (rect.width * logo.position.x) / 100
      const offsetY = clientY - rect.top - (rect.height * logo.position.y) / 100
      setDragOffset({ x: offsetX, y: offsetY })
    }
  }

  // Handle drag move for logo positioning
  const handleDragMove = (e: React.MouseEvent | React.TouchEvent) => {
    if (!isDragging || selectedLogoIndex === null || !containerRef.current) return

    e.preventDefault()

    let clientX: number, clientY: number

    if ("touches" in e) {
      clientX = e.touches[0].clientX
      clientY = e.touches[0].clientY
    } else {
      clientX = e.clientX
      clientY = e.clientY
    }

    const rect = containerRef.current.getBoundingClientRect()
    const x = ((clientX - rect.left - dragOffset.x) / rect.width) * 100
    const y = ((clientY - rect.top - dragOffset.y) / rect.height) * 100

    const newLogos = [...logos]
    newLogos[selectedLogoIndex] = {
      ...newLogos[selectedLogoIndex],
      position: {
        x: Math.max(0, Math.min(100, x)),
        y: Math.max(0, Math.min(100, y)),
      },
    }
    setLogos(newLogos)
  }

  // Handle drag end
  const handleDragEnd = () => {
    setIsDragging(false)
  }

  // Update logo size
  const updateLogoSize = (size: number) => {
    if (selectedLogoIndex === null) return

    const newLogos = [...logos]
    newLogos[selectedLogoIndex] = {
      ...newLogos[selectedLogoIndex],
      size,
    }
    setLogos(newLogos)
  }

  // Update logo rotation
  const updateLogoRotation = (rotation: number) => {
    if (selectedLogoIndex === null) return

    const newLogos = [...logos]
    newLogos[selectedLogoIndex] = {
      ...newLogos[selectedLogoIndex],
      rotation,
    }
    setLogos(newLogos)
  }

  // Update logo position
  const updateLogoPosition = (x: number, y: number) => {
    if (selectedLogoIndex === null) return

    const newLogos = [...logos]
    newLogos[selectedLogoIndex] = {
      ...newLogos[selectedLogoIndex],
      position: { x, y },
    }
    setLogos(newLogos)
  }

  // Update logo filter
  const updateLogoFilter = (filter: keyof LogoData["filters"], value: number) => {
    if (selectedLogoIndex === null) return

    const newLogos = [...logos]
    newLogos[selectedLogoIndex] = {
      ...newLogos[selectedLogoIndex],
      filters: {
        ...newLogos[selectedLogoIndex].filters,
        [filter]: value,
      },
    }
    setLogos(newLogos)
  }

  // Reset logo position and settings
  const resetLogo = () => {
    if (selectedLogoIndex === null) return

    const newLogos = [...logos]
    newLogos[selectedLogoIndex] = {
      ...newLogos[selectedLogoIndex],
      position: { x: 50, y: 50 },
      size: 30,
      rotation: 0,
      filters: {
        brightness: 100,
        contrast: 100,
        hue: 0,
        saturation: 100,
      },
    }
    setLogos(newLogos)
  }

  // Handle download
  const handleDownload = () => {
    if (!containerRef.current) return

    // In a real implementation, you would use a library like html2canvas
    // to capture the mockup as an image
    alert("In a production environment, this would download your mockup as an image.")
  }

  // Toggle left panel
  const toggleLeftPanel = () => {
    setShowLeftPanel(!showLeftPanel)
  }

  // Toggle right panel
  const toggleRightPanel = () => {
    setShowRightPanel(!showRightPanel)
  }

  // Generate logo with AI
  const generateLogoWithAI = () => {
    if (!aiPrompt.trim()) return

    setIsGenerating(true)

    // Simulate AI generation with a timeout
    setTimeout(() => {
      // In a real implementation, this would call an AI API
      // For now, we'll just generate placeholder images
      const newGeneratedLogos = [
        `/bakery.png?key=ai1&query=${encodeURIComponent(aiPrompt)}`,
        `/tech.png?key=ai2&query=${encodeURIComponent(aiPrompt)}`,
        `/gym.png?key=ai3&query=${encodeURIComponent(aiPrompt)}`,
      ]

      setGeneratedLogos(newGeneratedLogos)
      setIsGenerating(false)
    }, 2000)
  }

  // Add generated logo to canvas
  const addGeneratedLogo = (url: string) => {
    addLogo(null, url)
  }

  // Set up event listeners for drag end
  useEffect(() => {
    window.addEventListener("mouseup", handleDragEnd)
    window.addEventListener("touchend", handleDragEnd)

    return () => {
      window.removeEventListener("mouseup", handleDragEnd)
      window.removeEventListener("touchend", handleDragEnd)
    }
  }, [])

  // Get CSS filter string for a logo
  const getLogoFilterStyle = (filters: LogoData["filters"]) => {
    return `brightness(${filters.brightness}%) contrast(${filters.contrast}%) hue-rotate(${filters.hue}deg) saturate(${filters.saturation}%)`
  }

  return (
    <div className="flex flex-col min-h-screen">
      <header className="border-b p-4">
        <div className="container flex items-center justify-between mx-auto">
          <div className="flex items-center gap-2">
            <Button variant="outline" size="icon" onClick={toggleLeftPanel}>
              <PanelLeft className="h-4 w-4" />
            </Button>
            <h1 className="text-2xl font-bold">Mockup Editor</h1>
          </div>
          <div className="flex items-center gap-2">
            <Button onClick={handleDownload} className="gap-2">
              <Download className="h-4 w-4" /> Download
            </Button>
            <Button variant="outline" size="icon" onClick={toggleRightPanel}>
              <PanelRight className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </header>

      <main className="flex-1 container py-6 mx-auto">
        <div
          className="grid gap-6"
          style={{
            gridTemplateColumns: `${showLeftPanel ? "300px" : "0px"} 1fr ${showRightPanel ? "300px" : "0px"}`,
          }}
        >
          {/* Left Panel - Templates */}
          {showLeftPanel && (
            <div className="space-y-6 transition-all duration-300">
              <div className="p-4 border rounded-lg space-y-4">
                <h2 className="font-semibold text-lg flex items-center gap-2">
                  <Layers className="h-5 w-5" /> Templates
                </h2>
                <p className="text-sm text-gray-500">
                  Choose a template to start designing your mockup. You can customize it with your logos and colors.
                </p>

                <div className="grid grid-cols-2 gap-2">
                  {Object.entries(templateNames).map(([id, name]) => (
                    <div
                      key={id}
                      className={`border rounded-lg p-2 cursor-pointer transition-all hover:border-primary ${selectedTemplate === id ? "border-primary bg-primary/5" : ""}`}
                      onClick={() => setSelectedTemplate(id)}
                    >
                      <div className="relative w-full aspect-square mb-1">
                        <Image
                          src={templateImages[id] || "/placeholder.svg"}
                          alt={name}
                          fill
                          className="object-contain p-1"
                        />
                      </div>
                      <p className="text-xs text-center font-medium">{name}</p>
                    </div>
                  ))}
                </div>
              </div>

              <div className="p-4 border rounded-lg space-y-4">
                <h2 className="font-semibold text-lg flex items-center gap-2">
                  <Sparkles className="h-5 w-5" /> AI Logo Generator
                </h2>
                <p className="text-sm text-gray-500">
                  Generate logo ideas using AI. Describe what you want and our AI will create options for you.
                </p>

                <div className="space-y-2">
                  <Label htmlFor="ai-prompt">Describe your logo</Label>
                  <Textarea
                    id="ai-prompt"
                    placeholder="E.g., A minimalist coffee bean logo with blue and brown colors"
                    value={aiPrompt}
                    onChange={(e) => setAiPrompt(e.target.value)}
                  />
                </div>

                <div className="space-y-2">
                  <Button
                    onClick={generateLogoWithAI}
                    className="w-full gap-2"
                    disabled={!aiPrompt.trim() || isGenerating}
                  >
                    <Sparkles className="h-4 w-4" />
                    {isGenerating ? "Generating..." : "Generate Logo Ideas"}
                  </Button>

                  <div className="text-xs text-gray-500">
                    Example prompts:
                    <ul className="mt-1 space-y-1">
                      <li
                        className="cursor-pointer hover:text-primary"
                        onClick={() => setAiPrompt("A modern tech company logo with gradient blue colors")}
                      >
                        • A modern tech company logo with gradient blue colors
                      </li>
                      <li
                        className="cursor-pointer hover:text-primary"
                        onClick={() => setAiPrompt("A vintage bakery logo with wheat and rolling pin")}
                      >
                        • A vintage bakery logo with wheat and rolling pin
                      </li>
                      <li
                        className="cursor-pointer hover:text-primary"
                        onClick={() => setAiPrompt("A fitness gym logo with a dumbbell silhouette")}
                      >
                        • A fitness gym logo with a dumbbell silhouette
                      </li>
                    </ul>
                  </div>
                </div>

                {generatedLogos.length > 0 && (
                  <div className="space-y-2">
                    <Label>Generated Logos</Label>
                    <div className="grid grid-cols-3 gap-2">
                      {generatedLogos.map((url, index) => (
                        <div
                          key={index}
                          className="border rounded-lg p-1 cursor-pointer hover:border-primary"
                          onClick={() => addGeneratedLogo(url)}
                        >
                          <div className="relative w-full aspect-square">
                            <Image
                              src={url || "/placeholder.svg"}
                              alt={`Generated logo ${index + 1}`}
                              fill
                              className="object-contain"
                            />
                          </div>
                          <p className="text-xs text-center mt-1">Add</p>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Editor Preview */}
          <div className="relative bg-gray-100 rounded-lg overflow-hidden">
            <div
              ref={containerRef}
              className="relative w-full aspect-square"
              onMouseMove={handleDragMove}
              onTouchMove={handleDragMove}
            >
              <Image
                src={templateImages[selectedTemplate] || "/placeholder.svg"}
                alt={templateNames[selectedTemplate] || "Template"}
                fill
                className="object-contain"
              />

              {logos.map(
                (logo, index) =>
                  logo.url && (
                    <div
                      key={logo.id}
                      className={`absolute cursor-move ${selectedLogoIndex === index ? "ring-2 ring-primary ring-offset-2" : ""}`}
                      style={{
                        left: `${logo.position.x}%`,
                        top: `${logo.position.y}%`,
                        transform: `translate(-50%, -50%) rotate(${logo.rotation}deg)`,
                        width: `${logo.size}%`,
                        height: "auto",
                        touchAction: "none",
                        zIndex: selectedLogoIndex === index ? 10 : 1,
                      }}
                      onMouseDown={(e) => handleDragStart(e, index)}
                      onTouchStart={(e) => handleDragStart(e, index)}
                    >
                      <Image
                        src={logo.url || "/placeholder.svg"}
                        alt={`Logo ${index + 1}`}
                        width={200}
                        height={200}
                        className="w-full h-auto object-contain"
                        style={{
                          pointerEvents: "none",
                          filter: getLogoFilterStyle(logo.filters),
                        }}
                      />
                    </div>
                  ),
              )}

              {logos.length === 0 && (
                <div className="absolute inset-0 flex items-center justify-center">
                  <div className="bg-white/80 p-6 rounded-lg text-center">
                    <Upload className="h-12 w-12 mx-auto mb-2 text-gray-400" />
                    <p className="text-lg font-medium">Upload your logo to get started</p>
                    <p className="text-sm text-gray-500 mt-2">For best results, use a transparent PNG file</p>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Right Panel - Editor Controls */}
          {showRightPanel && (
            <div className="space-y-6 transition-all duration-300">
              <Tabs value={activeTab} onValueChange={setActiveTab}>
                <TabsList className="grid grid-cols-3 w-full">
                  <TabsTrigger value="logo">Logos</TabsTrigger>
                  <TabsTrigger value="colors">Colors</TabsTrigger>
                  <TabsTrigger value="template">Template</TabsTrigger>
                </TabsList>

                <TabsContent value="logo" className="space-y-6 pt-4">
                  <div className="p-4 border rounded-lg space-y-4">
                    <h2 className="font-semibold text-lg flex items-center gap-2">
                      <ImageIcon className="h-5 w-5" /> Manage Logos
                    </h2>

                    <div className="flex flex-wrap gap-2">
                      {logos.map((logo, index) => (
                        <div
                          key={logo.id}
                          className={`border rounded-lg p-1 cursor-pointer ${selectedLogoIndex === index ? "border-primary bg-primary/5" : ""}`}
                          onClick={() => setSelectedLogoIndex(index)}
                        >
                          <div className="relative w-12 h-12">
                            {logo.url && (
                              <Image
                                src={logo.url || "/placeholder.svg"}
                                alt={`Logo ${index + 1}`}
                                fill
                                className="object-contain"
                                style={{ filter: getLogoFilterStyle(logo.filters) }}
                              />
                            )}
                          </div>
                        </div>
                      ))}
                    </div>

                    <div className="flex flex-col gap-2">
                      <input
                        type="file"
                        id="logo-upload-side"
                        accept="image/*"
                        onChange={handleFileChange}
                        className="hidden"
                      />
                      <label htmlFor="logo-upload-side">
                        <Button variant="outline" className="w-full gap-2" asChild>
                          <span>
                            <Upload className="h-4 w-4" /> Upload New Logo
                          </span>
                        </Button>
                      </label>

                      {selectedLogo && (
                        <>
                          <Button variant="outline" onClick={resetLogo} className="gap-2">
                            <RotateCcw className="h-4 w-4" /> Reset Position
                          </Button>
                          <Button
                            variant="outline"
                            onClick={removeLogo}
                            className="gap-2 text-destructive hover:text-destructive"
                          >
                            <Trash2 className="h-4 w-4" /> Remove Logo
                          </Button>
                        </>
                      )}
                    </div>
                  </div>

                  {selectedLogo && (
                    <div className="p-4 border rounded-lg space-y-4">
                      <h2 className="font-semibold text-lg">Logo Settings</h2>

                      <div className="relative w-full aspect-video border rounded-lg mb-2 overflow-hidden">
                        {selectedLogo.url && (
                          <Image
                            src={selectedLogo.url || "/placeholder.svg"}
                            alt="Selected logo"
                            fill
                            className="object-contain"
                            style={{ filter: getLogoFilterStyle(selectedLogo.filters) }}
                          />
                        )}
                      </div>

                      <div className="space-y-2">
                        <div className="flex items-center justify-between">
                          <span className="text-sm">Size</span>
                          <div className="flex items-center gap-2">
                            <ZoomIn className="h-4 w-4 text-gray-500" />
                            <span className="text-sm">{selectedLogo.size}%</span>
                          </div>
                        </div>
                        <Slider
                          value={[selectedLogo.size]}
                          min={5}
                          max={80}
                          step={1}
                          onValueChange={(value) => updateLogoSize(value[0])}
                        />
                      </div>

                      <div className="space-y-2">
                        <div className="flex items-center justify-between">
                          <span className="text-sm">Rotation</span>
                          <span className="text-sm">{selectedLogo.rotation}°</span>
                        </div>
                        <Slider
                          value={[selectedLogo.rotation]}
                          min={0}
                          max={360}
                          step={1}
                          onValueChange={(value) => updateLogoRotation(value[0])}
                        />
                      </div>

                      <div className="flex items-center gap-2">
                        <Move className="h-4 w-4 text-gray-500" />
                        <span className="text-sm">Drag logo to position</span>
                      </div>

                      <div className="grid grid-cols-2 gap-2">
                        <div className="space-y-1">
                          <Label htmlFor="position-x">X Position</Label>
                          <Input
                            id="position-x"
                            type="number"
                            value={Math.round(selectedLogo.position.x)}
                            onChange={(e) => updateLogoPosition(Number(e.target.value), selectedLogo.position.y)}
                            min={0}
                            max={100}
                          />
                        </div>
                        <div className="space-y-1">
                          <Label htmlFor="position-y">Y Position</Label>
                          <Input
                            id="position-y"
                            type="number"
                            value={Math.round(selectedLogo.position.y)}
                            onChange={(e) => updateLogoPosition(selectedLogo.position.x, Number(e.target.value))}
                            min={0}
                            max={100}
                          />
                        </div>
                      </div>
                    </div>
                  )}
                </TabsContent>

                <TabsContent value="colors" className="space-y-6 pt-4">
                  {selectedLogo ? (
                    <div className="p-4 border rounded-lg space-y-4">
                      <h2 className="font-semibold text-lg flex items-center gap-2">
                        <Palette className="h-5 w-5" /> Logo Color Adjustments
                      </h2>

                      <div className="relative w-full aspect-video border rounded-lg mb-2 overflow-hidden">
                        {selectedLogo.url && (
                          <Image
                            src={selectedLogo.url || "/placeholder.svg"}
                            alt="Selected logo"
                            fill
                            className="object-contain"
                            style={{ filter: getLogoFilterStyle(selectedLogo.filters) }}
                          />
                        )}
                      </div>

                      <div className="space-y-4">
                        <div className="space-y-2">
                          <div className="flex items-center justify-between">
                            <span className="text-sm flex items-center gap-1">
                              <SunMedium className="h-4 w-4" /> Brightness
                            </span>
                            <span className="text-sm">{selectedLogo.filters.brightness}%</span>
                          </div>
                          <Slider
                            value={[selectedLogo.filters.brightness]}
                            min={0}
                            max={200}
                            step={1}
                            onValueChange={(value) => updateLogoFilter("brightness", value[0])}
                          />
                        </div>

                        <div className="space-y-2">
                          <div className="flex items-center justify-between">
                            <span className="text-sm flex items-center gap-1">
                              <Contrast className="h-4 w-4" /> Contrast
                            </span>
                            <span className="text-sm">{selectedLogo.filters.contrast}%</span>
                          </div>
                          <Slider
                            value={[selectedLogo.filters.contrast]}
                            min={0}
                            max={200}
                            step={1}
                            onValueChange={(value) => updateLogoFilter("contrast", value[0])}
                          />
                        </div>

                        <div className="space-y-2">
                          <div className="flex items-center justify-between">
                            <span className="text-sm">Hue Rotation</span>
                            <span className="text-sm">{selectedLogo.filters.hue}°</span>
                          </div>
                          <Slider
                            value={[selectedLogo.filters.hue]}
                            min={0}
                            max={360}
                            step={1}
                            onValueChange={(value) => updateLogoFilter("hue", value[0])}
                          />
                        </div>

                        <div className="space-y-2">
                          <div className="flex items-center justify-between">
                            <span className="text-sm">Saturation</span>
                            <span className="text-sm">{selectedLogo.filters.saturation}%</span>
                          </div>
                          <Slider
                            value={[selectedLogo.filters.saturation]}
                            min={0}
                            max={200}
                            step={1}
                            onValueChange={(value) => updateLogoFilter("saturation", value[0])}
                          />
                        </div>

                        <Button
                          variant="outline"
                          onClick={() => {
                            if (selectedLogoIndex === null) return
                            const newLogos = [...logos]
                            newLogos[selectedLogoIndex] = {
                              ...newLogos[selectedLogoIndex],
                              filters: {
                                brightness: 100,
                                contrast: 100,
                                hue: 0,
                                saturation: 100,
                              },
                            }
                            setLogos(newLogos)
                          }}
                          className="w-full"
                        >
                          Reset Color Adjustments
                        </Button>
                      </div>
                    </div>
                  ) : (
                    <div className="p-4 border rounded-lg">
                      <p className="text-center text-gray-500">Select a logo to adjust its colors</p>
                    </div>
                  )}

                  <div className="p-4 border rounded-lg space-y-4">
                    <h2 className="font-semibold text-lg">Color Presets</h2>
                    <div className="grid grid-cols-2 gap-2">
                      <Button
                        variant="outline"
                        className="h-auto py-2"
                        onClick={() => {
                          if (selectedLogoIndex === null) return
                          const newLogos = [...logos]
                          newLogos[selectedLogoIndex] = {
                            ...newLogos[selectedLogoIndex],
                            filters: {
                              brightness: 100,
                              contrast: 120,
                              hue: 0,
                              saturation: 110,
                            },
                          }
                          setLogos(newLogos)
                        }}
                      >
                        <div className="flex flex-col items-center">
                          <span className="font-medium">Vibrant</span>
                          <span className="text-xs text-gray-500">High contrast & saturation</span>
                        </div>
                      </Button>

                      <Button
                        variant="outline"
                        className="h-auto py-2"
                        onClick={() => {
                          if (selectedLogoIndex === null) return
                          const newLogos = [...logos]
                          newLogos[selectedLogoIndex] = {
                            ...newLogos[selectedLogoIndex],
                            filters: {
                              brightness: 110,
                              contrast: 90,
                              hue: 0,
                              saturation: 80,
                            },
                          }
                          setLogos(newLogos)
                        }}
                      >
                        <div className="flex flex-col items-center">
                          <span className="font-medium">Soft</span>
                          <span className="text-xs text-gray-500">Muted & gentle colors</span>
                        </div>
                      </Button>

                      <Button
                        variant="outline"
                        className="h-auto py-2"
                        onClick={() => {
                          if (selectedLogoIndex === null) return
                          const newLogos = [...logos]
                          newLogos[selectedLogoIndex] = {
                            ...newLogos[selectedLogoIndex],
                            filters: {
                              brightness: 100,
                              contrast: 100,
                              hue: 180,
                              saturation: 100,
                            },
                          }
                          setLogos(newLogos)
                        }}
                      >
                        <div className="flex flex-col items-center">
                          <span className="font-medium">Invert Hue</span>
                          <span className="text-xs text-gray-500">Opposite colors</span>
                        </div>
                      </Button>

                      <Button
                        variant="outline"
                        className="h-auto py-2"
                        onClick={() => {
                          if (selectedLogoIndex === null) return
                          const newLogos = [...logos]
                          newLogos[selectedLogoIndex] = {
                            ...newLogos[selectedLogoIndex],
                            filters: {
                              brightness: 120,
                              contrast: 110,
                              hue: 0,
                              saturation: 0,
                            },
                          }
                          setLogos(newLogos)
                        }}
                      >
                        <div className="flex flex-col items-center">
                          <span className="font-medium">Grayscale</span>
                          <span className="text-xs text-gray-500">Black & white</span>
                        </div>
                      </Button>
                    </div>
                  </div>
                </TabsContent>

                <TabsContent value="template" className="space-y-6 pt-4">
                  <div className="p-4 border rounded-lg space-y-4">
                    <h2 className="font-semibold text-lg">Template Settings</h2>

                    <div className="space-y-2">
                      <Label htmlFor="template-select">Selected Template</Label>
                      <Select value={selectedTemplate} onValueChange={setSelectedTemplate}>
                        <SelectTrigger id="template-select">
                          <SelectValue placeholder="Select template" />
                        </SelectTrigger>
                        <SelectContent>
                          {Object.entries(templateNames).map(([id, name]) => (
                            <SelectItem key={id} value={id}>
                              {name}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="template-preview">Template Preview</Label>
                      <div className="relative w-full aspect-square border rounded-lg overflow-hidden">
                        <Image
                          src={templateImages[selectedTemplate] || "/placeholder.svg"}
                          alt={templateNames[selectedTemplate] || "Template"}
                          fill
                          className="object-contain"
                        />
                      </div>
                    </div>
                  </div>

                  <div className="p-4 border rounded-lg space-y-4">
                    <h2 className="font-semibold text-lg">Export Settings</h2>

                    <div className="space-y-2">
                      <Label htmlFor="export-format">Export Format</Label>
                      <Select defaultValue="png">
                        <SelectTrigger id="export-format">
                          <SelectValue placeholder="Select format" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="png">PNG Image</SelectItem>
                          <SelectItem value="jpg">JPG Image</SelectItem>
                          <SelectItem value="pdf">PDF Document</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="export-quality">Image Quality</Label>
                      <Select defaultValue="high">
                        <SelectTrigger id="export-quality">
                          <SelectValue placeholder="Select quality" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="low">Low (72 DPI)</SelectItem>
                          <SelectItem value="medium">Medium (150 DPI)</SelectItem>
                          <SelectItem value="high">High (300 DPI)</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>

                    <Button onClick={handleDownload} className="w-full gap-2">
                      <Download className="h-4 w-4" /> Download Mockup
                    </Button>
                  </div>
                </TabsContent>
              </Tabs>
            </div>
          )}
        </div>
      </main>
    </div>
  )
}
