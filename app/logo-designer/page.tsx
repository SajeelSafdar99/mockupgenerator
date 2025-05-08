"use client"

import type React from "react"

import { useState, useRef, useEffect } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Slider } from "@/components/ui/slider"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import ColorPicker from "@/components/color-picker"
import {
  Square,
  Circle,
  Type,
  ImageIcon,
  Download,
  Undo,
  Redo,
  Bold,
  Italic,
  AlignLeft,
  AlignCenter,
  AlignRight,
  Minus,
  Save,
  ArrowLeft,
  ImagesIcon as Icons,
  Shapes,
  Heart,
  Star,
  Triangle,
  Hexagon,
  Bookmark,
  Award,
  Zap,
  Droplet,
  Layers,
  Upload,
} from "lucide-react"

interface CanvasObject {
  id: string
  type: "shape" | "text" | "icon" | "image"
  x: number
  y: number
  width: number
  height: number
  fill: string
  stroke: string
  strokeWidth: number
  rotation: number
  opacity: number
  shape?: "square" | "circle" | "line" | "triangle" | "star" | "heart" | "hexagon"
  text?: string
  fontSize?: number
  fontFamily?: string
  fontWeight?: string
  fontStyle?: string
  textAlign?: string
  icon?: string
  imageUrl?: string
  imageElement?: HTMLImageElement
  gradient?: {
    type: "linear" | "radial"
    colors: string[]
    stops: number[]
    angle?: number
  }
}

export default function LogoDesignerPage() {
  const router = useRouter()
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const [activeTab, setActiveTab] = useState("shapes")
  const [canvasHistory, setCanvasHistory] = useState<CanvasObject[][]>([])
  const [historyIndex, setHistoryIndex] = useState(-1)
  const [objects, setObjects] = useState<CanvasObject[]>([])
  const [selectedObjectId, setSelectedObjectId] = useState<string | null>(null)
  const [textInput, setTextInput] = useState("")
  const [fontSize, setFontSize] = useState(24)
  const [fontFamily, setFontFamily] = useState("Arial")
  const [fontWeight, setFontWeight] = useState("normal")
  const [fontStyle, setFontStyle] = useState("normal")
  const [textAlign, setTextAlign] = useState("center")
  // Make sure the default colors are explicitly set to black
  const [fillColor, setFillColor] = useState("#000000") // Black for fill
  const [strokeColor, setStrokeColor] = useState("#000000") // Black for stroke
  const [strokeWidth, setStrokeWidth] = useState(0)
  const [opacity, setOpacity] = useState(100)
  const [isDragging, setIsDragging] = useState(false)
  const [dragOffset, setDragOffset] = useState({ x: 0, y: 0 })
  const [useGradient, setUseGradient] = useState(false)
  const [gradientType, setGradientType] = useState<"linear" | "radial">("linear")
  const [gradientColors, setGradientColors] = useState<string[]>(["#ff0000", "#0000ff"])
  const [gradientStops, setGradientStops] = useState<number[]>([0, 100])
  const [gradientAngle, setGradientAngle] = useState(90)
  const [logoName, setLogoName] = useState("My Logo")
  const [uploadError, setUploadError] = useState<string | null>(null)

  const selectedObject = objects.find((obj) => obj.id === selectedObjectId) || null

  // Initialize canvas
  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return

    const ctx = canvas.getContext("2d")
    if (!ctx) return

    // Set canvas size
    canvas.width = 500
    canvas.height = 500

    // Fill with white background
    ctx.fillStyle = "white"
    ctx.fillRect(0, 0, canvas.width, canvas.height)

    // Save initial state
    saveCanvasState()
  }, [])

  // Render canvas whenever objects change
  useEffect(() => {
    renderCanvas()
  }, [
    objects,
    selectedObjectId,
    fillColor,
    strokeColor,
    strokeWidth,
    opacity,
    useGradient,
    gradientType,
    gradientColors,
    gradientStops,
    gradientAngle,
  ])

  // Update form values when selected object changes
  useEffect(() => {
    if (selectedObject) {
      setFillColor(selectedObject.fill)
      setStrokeColor(selectedObject.stroke)
      setStrokeWidth(selectedObject.strokeWidth)
      setOpacity(selectedObject.opacity)

      if (selectedObject.type === "text") {
        setTextInput(selectedObject.text || "")
        setFontSize(selectedObject.fontSize || 24)
        setFontFamily(selectedObject.fontFamily || "Arial")
        setFontWeight(selectedObject.fontWeight || "normal")
        setFontStyle(selectedObject.fontStyle || "normal")
        setTextAlign(selectedObject.textAlign || "center")
      }

      if (selectedObject.gradient) {
        setUseGradient(true)
        setGradientType(selectedObject.gradient.type)
        setGradientColors(selectedObject.gradient.colors)
        setGradientStops(selectedObject.gradient.stops)
        if (selectedObject.gradient.angle) {
          setGradientAngle(selectedObject.gradient.angle)
        }
      } else {
        setUseGradient(false)
      }
    }
  }, [selectedObjectId, selectedObject])

  const renderCanvas = () => {
    const canvas = canvasRef.current
    if (!canvas) return

    const ctx = canvas.getContext("2d")
    if (!ctx) return

    // Clear canvas
    ctx.fillStyle = "white"
    ctx.fillRect(0, 0, canvas.width, canvas.height)

    // Draw all objects
    objects.forEach((obj) => {
      ctx.save()

      // Apply transformations
      ctx.translate(obj.x, obj.y)
      ctx.rotate((obj.rotation * Math.PI) / 180)
      ctx.globalAlpha = obj.opacity / 100

      // Create gradient if needed
      let fillStyle: string | CanvasGradient = obj.fill
      if (obj.gradient) {
        if (obj.gradient.type === "linear") {
          const gradient = ctx.createLinearGradient(-obj.width / 2, 0, obj.width / 2, 0)
          obj.gradient.colors.forEach((color, index) => {
            gradient.addColorStop(obj.gradient!.stops[index] / 100, color)
          })
          fillStyle = gradient
        } else {
          const gradient = ctx.createRadialGradient(0, 0, 0, 0, 0, obj.width / 2)
          obj.gradient.colors.forEach((color, index) => {
            gradient.addColorStop(obj.gradient!.stops[index] / 100, color)
          })
          fillStyle = gradient
        }
      }

      // Apply current color to selected object
      if (obj.id === selectedObjectId) {
        if (!useGradient) {
          fillStyle = fillColor
        }
      }

      // Draw based on object type
      if (obj.type === "shape") {
        ctx.fillStyle = fillStyle
        ctx.strokeStyle = obj.stroke
        ctx.lineWidth = obj.strokeWidth

        if (obj.shape === "square") {
          ctx.fillRect(-obj.width / 2, -obj.height / 2, obj.width, obj.height)
          if (obj.strokeWidth > 0) {
            ctx.strokeRect(-obj.width / 2, -obj.height / 2, obj.width, obj.height)
          }
        } else if (obj.shape === "circle") {
          ctx.beginPath()
          ctx.arc(0, 0, obj.width / 2, 0, Math.PI * 2)
          ctx.fill()
          if (obj.strokeWidth > 0) {
            ctx.stroke()
          }
        } else if (obj.shape === "line") {
          ctx.beginPath()
          ctx.moveTo(-obj.width / 2, 0)
          ctx.lineTo(obj.width / 2, 0)
          ctx.strokeStyle = obj.fill
          ctx.lineWidth = obj.height
          ctx.stroke()
        } else if (obj.shape === "triangle") {
          ctx.beginPath()
          ctx.moveTo(0, -obj.height / 2)
          ctx.lineTo(-obj.width / 2, obj.height / 2)
          ctx.lineTo(obj.width / 2, obj.height / 2)
          ctx.closePath()
          ctx.fill()
          if (obj.strokeWidth > 0) {
            ctx.stroke()
          }
        } else if (obj.shape === "star") {
          const spikes = 5
          const outerRadius = obj.width / 2
          const innerRadius = obj.width / 4

          ctx.beginPath()
          for (let i = 0; i < spikes * 2; i++) {
            const radius = i % 2 === 0 ? outerRadius : innerRadius
            const angle = (Math.PI / spikes) * i
            ctx.lineTo(Math.cos(angle) * radius, Math.sin(angle) * radius)
          }
          ctx.closePath()
          ctx.fill()
          if (obj.strokeWidth > 0) {
            ctx.stroke()
          }
        } else if (obj.shape === "heart") {
          const width = obj.width
          const height = obj.height

          ctx.beginPath()
          ctx.moveTo(0, height / 4)
          ctx.bezierCurveTo(width / 4, -height / 4, width / 2, -height / 4, width / 2, height / 4)
          ctx.bezierCurveTo(width / 2, height / 2, 0, height / 2, 0, height / 4)
          ctx.bezierCurveTo(0, height / 2, -width / 2, height / 2, -width / 2, height / 4)
          ctx.bezierCurveTo(-width / 2, -height / 4, -width / 4, -height / 4, 0, height / 4)
          ctx.fill()
          if (obj.strokeWidth > 0) {
            ctx.stroke()
          }
        } else if (obj.shape === "hexagon") {
          const radius = obj.width / 2
          ctx.beginPath()
          for (let i = 0; i < 6; i++) {
            const angle = (Math.PI / 3) * i
            ctx.lineTo(Math.cos(angle) * radius, Math.sin(angle) * radius)
          }
          ctx.closePath()
          ctx.fill()
          if (obj.strokeWidth > 0) {
            ctx.stroke()
          }
        }
      } else if (obj.type === "text" && obj.text) {
        ctx.fillStyle = fillStyle
        ctx.font = `${obj.fontStyle} ${obj.fontWeight} ${obj.fontSize}px ${obj.fontFamily}`
        ctx.textAlign = obj.textAlign as CanvasTextAlign
        ctx.textBaseline = "middle"
        ctx.fillText(obj.text, 0, 0)

        if (obj.strokeWidth > 0) {
          ctx.strokeStyle = obj.stroke
          ctx.lineWidth = obj.strokeWidth
          ctx.strokeText(obj.text, 0, 0)
        }
      } else if (obj.type === "icon") {
        // Apply current color to selected icon
        ctx.fillStyle = fillStyle

        if (obj.icon === "heart") {
          const width = obj.width
          const height = obj.height

          ctx.beginPath()
          ctx.moveTo(0, height / 4)
          ctx.bezierCurveTo(width / 4, -height / 4, width / 2, -height / 4, width / 2, height / 4)
          ctx.bezierCurveTo(width / 2, height / 2, 0, height / 2, 0, height / 4)
          ctx.bezierCurveTo(0, height / 2, -width / 2, height / 2, -width / 2, height / 4)
          ctx.bezierCurveTo(-width / 2, -height / 4, -width / 4, -height / 4, 0, height / 4)
          ctx.fill()
        } else if (obj.icon === "star") {
          const spikes = 5
          const outerRadius = obj.width / 2
          const innerRadius = obj.width / 4

          ctx.beginPath()
          for (let i = 0; i < spikes * 2; i++) {
            const radius = i % 2 === 0 ? outerRadius : innerRadius
            const angle = (Math.PI / spikes) * i
            ctx.lineTo(Math.cos(angle) * radius, Math.sin(angle) * radius)
          }
          ctx.closePath()
          ctx.fill()
        } else if (obj.icon === "bookmark") {
          ctx.beginPath()
          ctx.moveTo(-obj.width / 4, -obj.height / 2)
          ctx.lineTo(obj.width / 4, -obj.height / 2)
          ctx.lineTo(obj.width / 4, obj.height / 2)
          ctx.lineTo(0, obj.height / 4)
          ctx.lineTo(-obj.width / 4, obj.height / 2)
          ctx.closePath()
          ctx.fill()
        } else if (obj.icon === "award") {
          ctx.beginPath()
          ctx.arc(0, -obj.height / 4, obj.width / 3, 0, Math.PI * 2)
          ctx.fill()
          ctx.beginPath()
          ctx.moveTo(-obj.width / 6, 0)
          ctx.lineTo(-obj.width / 4, obj.height / 2)
          ctx.lineTo(0, obj.height / 3)
          ctx.lineTo(obj.width / 4, obj.height / 2)
          ctx.lineTo(obj.width / 6, 0)
          ctx.closePath()
          ctx.fill()
        } else if (obj.icon === "zap") {
          ctx.beginPath()
          ctx.moveTo(0, -obj.height / 2)
          ctx.lineTo(-obj.width / 4, 0)
          ctx.lineTo(0, 0)
          ctx.lineTo(-obj.width / 4, obj.height / 2)
          ctx.lineTo(obj.width / 4, 0)
          ctx.lineTo(0, 0)
          ctx.lineTo(0, -obj.height / 2)
          ctx.closePath()
          ctx.fill()
        } else if (obj.icon === "droplet") {
          ctx.beginPath()
          ctx.moveTo(0, -obj.height / 2)
          ctx.bezierCurveTo(obj.width / 2, -obj.height / 4, obj.width / 2, obj.height / 4, 0, obj.height / 2)
          ctx.bezierCurveTo(-obj.width / 2, obj.height / 4, -obj.width / 2, -obj.height / 4, 0, -obj.height / 2)
          ctx.closePath()
          ctx.fill()
        }
      } else if (obj.type === "image" && obj.imageElement) {
        // Draw the image
        try {
          ctx.drawImage(obj.imageElement, -obj.width / 2, -obj.height / 2, obj.width, obj.height)
        } catch (error) {
          console.error("Error drawing image:", error)
        }
      }

      // Draw selection border if selected
      if (obj.id === selectedObjectId) {
        ctx.strokeStyle = "#2563eb"
        ctx.lineWidth = 2
        ctx.setLineDash([5, 5])

        if (obj.type === "shape" && obj.shape === "line") {
          ctx.strokeRect(-obj.width / 2 - 5, -obj.height / 2 - 5, obj.width + 10, obj.height + 10)
        } else if (obj.type === "text" && obj.text) {
          const textMetrics = ctx.measureText(obj.text)
          const textWidth = textMetrics.width
          const textHeight = obj.fontSize || 24
          ctx.strokeRect(-textWidth / 2 - 5, -textHeight / 2 - 5, textWidth + 10, textHeight + 10)
        } else {
          ctx.strokeRect(-obj.width / 2 - 5, -obj.height / 2 - 5, obj.width + 10, obj.height + 10)
        }

        ctx.setLineDash([])
      }

      ctx.restore()
    })
  }

  const saveCanvasState = () => {
    // If we're not at the end of the history, remove future states
    if (historyIndex < canvasHistory.length - 1) {
      setCanvasHistory((prev) => prev.slice(0, historyIndex + 1))
    }

    setCanvasHistory((prev) => [...prev, [...objects]])
    setHistoryIndex((prev) => prev + 1)
  }

  const undo = () => {
    if (historyIndex <= 0) return

    const newIndex = historyIndex - 1
    setObjects(canvasHistory[newIndex])
    setHistoryIndex(newIndex)
  }

  const redo = () => {
    if (historyIndex >= canvasHistory.length - 1) return

    const newIndex = historyIndex + 1
    setObjects(canvasHistory[newIndex])
    setHistoryIndex(newIndex)
  }

  // Also ensure that when adding a new shape or text, the color is explicitly set to black
  const addShape = (shape: CanvasObject["shape"]) => {
    const newShape: CanvasObject = {
      id: Date.now().toString(),
      type: "shape",
      shape,
      x: 250,
      y: 250,
      width: 100,
      height: shape === "line" ? 10 : 100,
      fill: "#000000", // Explicitly set to black
      stroke: strokeColor,
      strokeWidth,
      rotation: 0,
      opacity,
    }

    if (useGradient) {
      newShape.gradient = {
        type: gradientType,
        colors: [...gradientColors],
        stops: [...gradientStops],
        angle: gradientAngle,
      }
    }

    setObjects([...objects, newShape])
    setSelectedObjectId(newShape.id)
    saveCanvasState()
  }

  const addText = () => {
    if (!textInput.trim()) return

    const newText: CanvasObject = {
      id: Date.now().toString(),
      type: "text",
      text: textInput,
      x: 250,
      y: 250,
      width: 200,
      height: fontSize,
      fill: "#000000", // Explicitly set to black
      stroke: strokeColor,
      strokeWidth,
      rotation: 0,
      opacity,
      fontSize,
      fontFamily,
      fontWeight,
      fontStyle,
      textAlign,
    }

    if (useGradient) {
      newText.gradient = {
        type: gradientType,
        colors: [...gradientColors],
        stops: [...gradientStops],
        angle: gradientAngle,
      }
    }

    setObjects([...objects, newText])
    setSelectedObjectId(newText.id)
    saveCanvasState()
  }

  const addIcon = (icon: string) => {
    const newIcon: CanvasObject = {
      id: Date.now().toString(),
      type: "icon",
      icon,
      x: 250,
      y: 250,
      width: 80,
      height: 80,
      fill: "#000000", // Explicitly set to black
      stroke: strokeColor,
      strokeWidth,
      rotation: 0,
      opacity,
    }

    if (useGradient) {
      newIcon.gradient = {
        type: gradientType,
        colors: [...gradientColors],
        stops: [...gradientStops],
        angle: gradientAngle,
      }
    }

    setObjects([...objects, newIcon])
    setSelectedObjectId(newIcon.id)
    saveCanvasState()
  }

  // Completely rewritten image upload handler
  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    setUploadError(null)

    if (!e.target.files || !e.target.files[0]) {
      return
    }

    const file = e.target.files[0]

    // Check if file is an image
    if (!file.type.startsWith("image/")) {
      setUploadError("Please select an image file")
      e.target.value = ""
      return
    }

    // Create a blob URL for the file
    const blobUrl = URL.createObjectURL(file)

    // Create a new image element to load the image
    const img = new Image()
    img.crossOrigin = "anonymous" // Important for CORS

    // Set up load event handler
    img.onload = () => {
      // Create the new image object
      const newImage: CanvasObject = {
        id: Date.now().toString(),
        type: "image",
        imageUrl: blobUrl,
        imageElement: img, // Store the loaded image element
        x: 250,
        y: 250,
        width: 150,
        height: 150 * (img.height / img.width), // Maintain aspect ratio
        fill: "transparent",
        stroke: "transparent",
        strokeWidth: 0,
        rotation: 0,
        opacity,
      }

      // Add the new image to objects
      setObjects((prevObjects) => [...prevObjects, newImage])
      setSelectedObjectId(newImage.id)
      saveCanvasState()
    }

    // Set up error handler
    img.onerror = () => {
      URL.revokeObjectURL(blobUrl)
      setUploadError("Failed to load image. Please try another file.")
      e.target.value = ""
    }

    // Start loading the image
    img.src = blobUrl

    // Reset the input value so the same file can be selected again
    e.target.value = ""
  }

  const updateSelectedObject = (updates: Partial<CanvasObject>) => {
    if (!selectedObjectId) return

    const updatedObjects = objects.map((obj) => {
      if (obj.id === selectedObjectId) {
        return { ...obj, ...updates }
      }
      return obj
    })

    setObjects(updatedObjects)
  }

  const deleteSelectedObject = () => {
    if (!selectedObjectId) return

    // Clean up any blob URLs before removing the object
    const objToDelete = objects.find((obj) => obj.id === selectedObjectId)
    if (objToDelete?.type === "image" && objToDelete.imageUrl?.startsWith("blob:")) {
      URL.revokeObjectURL(objToDelete.imageUrl)
    }

    const updatedObjects = objects.filter((obj) => obj.id !== selectedObjectId)
    setObjects(updatedObjects)
    setSelectedObjectId(null)
    saveCanvasState()
  }

  const handleCanvasClick = (e: React.MouseEvent) => {
    const canvas = canvasRef.current
    if (!canvas) return

    const rect = canvas.getBoundingClientRect()
    const x = e.clientX - rect.left
    const y = e.clientY - rect.top

    // Check if clicked on an object
    let clickedObjectId: string | null = null

    // Iterate in reverse to check top objects first
    for (let i = objects.length - 1; i >= 0; i--) {
      const obj = objects[i]

      // Calculate object bounds
      const left = obj.x - obj.width / 2
      const right = obj.x + obj.width / 2
      const top = obj.y - obj.height / 2
      const bottom = obj.y + obj.height / 2

      // Simple bounding box check (doesn't account for rotation)
      if (x >= left && x <= right && y >= top && y <= bottom) {
        clickedObjectId = obj.id
        break
      }
    }

    // Set the selected object ID (or null if clicked on empty space)
    setSelectedObjectId(clickedObjectId)
  }

  const handleDragStart = (e: React.MouseEvent) => {
    if (!selectedObjectId) return

    setIsDragging(true)

    const canvas = canvasRef.current
    if (!canvas) return

    const rect = canvas.getBoundingClientRect()
    const x = e.clientX - rect.left
    const y = e.clientY - rect.top

    const obj = objects.find((o) => o.id === selectedObjectId)
    if (!obj) return

    setDragOffset({
      x: x - obj.x,
      y: y - obj.y,
    })
  }

  const handleDragMove = (e: React.MouseEvent) => {
    if (!isDragging || !selectedObjectId) return

    const canvas = canvasRef.current
    if (!canvas) return

    const rect = canvas.getBoundingClientRect()
    const x = e.clientX - rect.left
    const y = e.clientY - rect.top

    updateSelectedObject({
      x: x - dragOffset.x,
      y: y - dragOffset.y,
    })
  }

  const handleDragEnd = () => {
    if (isDragging) {
      setIsDragging(false)
      saveCanvasState()
    }
  }

  const downloadLogo = () => {
    const canvas = canvasRef.current
    if (!canvas) return

    // Convert canvas to data URL
    const dataUrl = canvas.toDataURL("image/png")

    // Create a download link
    const link = document.createElement("a")
    link.download = `${logoName.replace(/\s+/g, "-").toLowerCase()}.png`
    link.href = dataUrl
    link.click()
  }

  const downloadSVG = () => {
    // In a real implementation, we would convert the canvas to SVG
    // For this example, we'll just show an alert
    alert("In a production environment, this would download your logo as an SVG file.")
  }

  const saveLogo = () => {
    const canvas = canvasRef.current
    if (!canvas) return

    // Convert canvas to data URL
    const dataUrl = canvas.toDataURL("image/png")

    // In a real implementation, we would save this to a database
    // For this example, we'll just navigate back to the editor
    router.push("/editor")
  }

  // Clean up blob URLs when component unmounts
  useEffect(() => {
    return () => {
      objects.forEach((obj) => {
        if (obj.type === "image" && obj.imageUrl?.startsWith("blob:")) {
          URL.revokeObjectURL(obj.imageUrl)
        }
      })
    }
  }, [])

  return (
    <div className="flex flex-col min-h-screen">
      <header className="border-b p-4">
        <div className="container flex items-center justify-between mx-auto">
          <div className="flex items-center gap-2">
            <Button variant="outline" size="icon" onClick={() => router.push("/editor")}>
              <ArrowLeft className="h-4 w-4" />
            </Button>
            <h1 className="text-2xl font-bold">Logo Designer</h1>
          </div>
          <div className="flex items-center gap-2">
            <Input
              value={logoName}
              onChange={(e) => setLogoName(e.target.value)}
              className="w-48"
              placeholder="Logo Name"
            />
            <Button onClick={saveLogo} className="gap-2">
              <Save className="h-4 w-4" /> Save Logo
            </Button>
          </div>
        </div>
      </header>

      <main className="flex-1 container py-6 mx-auto">
        <div className="grid grid-cols-[300px_1fr_300px] gap-6">
          {/* Left Panel - Tools */}
          <div className="space-y-6">
            <Tabs defaultValue="shapes" onValueChange={setActiveTab}>
              <TabsList className="grid grid-cols-4 w-full">
                <TabsTrigger value="shapes">
                  <Shapes className="h-4 w-4" />
                </TabsTrigger>
                <TabsTrigger value="text">
                  <Type className="h-4 w-4" />
                </TabsTrigger>
                <TabsTrigger value="icons">
                  <Icons className="h-4 w-4" />
                </TabsTrigger>
                <TabsTrigger value="image">
                  <ImageIcon className="h-4 w-4" />
                </TabsTrigger>
              </TabsList>

              <TabsContent value="shapes" className="p-4 border rounded-lg mt-2">
                <h3 className="font-medium mb-3">Shapes</h3>
                <div className="grid grid-cols-3 gap-2">
                  <Button variant="outline" className="aspect-square p-0" onClick={() => addShape("square")}>
                    <Square className="h-6 w-6" />
                  </Button>
                  <Button variant="outline" className="aspect-square p-0" onClick={() => addShape("circle")}>
                    <Circle className="h-6 w-6" />
                  </Button>
                  <Button variant="outline" className="aspect-square p-0" onClick={() => addShape("line")}>
                    <Minus className="h-6 w-6" />
                  </Button>
                  <Button variant="outline" className="aspect-square p-0" onClick={() => addShape("triangle")}>
                    <Triangle className="h-6 w-6" />
                  </Button>
                  <Button variant="outline" className="aspect-square p-0" onClick={() => addShape("star")}>
                    <Star className="h-6 w-6" />
                  </Button>
                  <Button variant="outline" className="aspect-square p-0" onClick={() => addShape("heart")}>
                    <Heart className="h-6 w-6" />
                  </Button>
                  <Button variant="outline" className="aspect-square p-0" onClick={() => addShape("hexagon")}>
                    <Hexagon className="h-6 w-6" />
                  </Button>
                </div>
              </TabsContent>

              <TabsContent value="text" className="p-4 border rounded-lg mt-2 space-y-4">
                <h3 className="font-medium mb-3">Text</h3>
                <div className="space-y-2">
                  <Input placeholder="Enter text" value={textInput} onChange={(e) => setTextInput(e.target.value)} />

                  <div className="grid grid-cols-2 gap-2">
                    <div className="space-y-1">
                      <Label htmlFor="font-family">Font</Label>
                      <Select value={fontFamily} onValueChange={setFontFamily}>
                        <SelectTrigger id="font-family">
                          <SelectValue placeholder="Font Family" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="Arial">Arial</SelectItem>
                          <SelectItem value="Helvetica">Helvetica</SelectItem>
                          <SelectItem value="Times New Roman">Times New Roman</SelectItem>
                          <SelectItem value="Georgia">Georgia</SelectItem>
                          <SelectItem value="Verdana">Verdana</SelectItem>
                          <SelectItem value="Courier New">Courier New</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="space-y-1">
                      <Label htmlFor="font-size">Size</Label>
                      <div className="flex items-center">
                        <Input
                          id="font-size"
                          type="number"
                          value={fontSize}
                          onChange={(e) => setFontSize(Number(e.target.value))}
                          min={8}
                          max={120}
                        />
                        <span className="ml-1">px</span>
                      </div>
                    </div>
                  </div>

                  <div className="flex gap-2">
                    <Button
                      variant={fontWeight === "bold" ? "default" : "outline"}
                      size="sm"
                      onClick={() => setFontWeight(fontWeight === "bold" ? "normal" : "bold")}
                    >
                      <Bold className="h-4 w-4" />
                    </Button>
                    <Button
                      variant={fontStyle === "italic" ? "default" : "outline"}
                      size="sm"
                      onClick={() => setFontStyle(fontStyle === "italic" ? "normal" : "italic")}
                    >
                      <Italic className="h-4 w-4" />
                    </Button>
                    <Button
                      variant={textAlign === "left" ? "default" : "outline"}
                      size="sm"
                      onClick={() => setTextAlign("left")}
                    >
                      <AlignLeft className="h-4 w-4" />
                    </Button>
                    <Button
                      variant={textAlign === "center" ? "default" : "outline"}
                      size="sm"
                      onClick={() => setTextAlign("center")}
                    >
                      <AlignCenter className="h-4 w-4" />
                    </Button>
                    <Button
                      variant={textAlign === "right" ? "default" : "outline"}
                      size="sm"
                      onClick={() => setTextAlign("right")}
                    >
                      <AlignRight className="h-4 w-4" />
                    </Button>
                  </div>
                </div>

                <Button onClick={addText} className="w-full gap-2">
                  <Type className="h-4 w-4" /> Add Text
                </Button>
              </TabsContent>

              <TabsContent value="icons" className="p-4 border rounded-lg mt-2">
                <h3 className="font-medium mb-3">Icons</h3>
                <div className="grid grid-cols-3 gap-2">
                  <Button variant="outline" className="aspect-square p-0" onClick={() => addIcon("heart")}>
                    <Heart className="h-6 w-6" />
                  </Button>
                  <Button variant="outline" className="aspect-square p-0" onClick={() => addIcon("star")}>
                    <Star className="h-6 w-6" />
                  </Button>
                  <Button variant="outline" className="aspect-square p-0" onClick={() => addIcon("bookmark")}>
                    <Bookmark className="h-6 w-6" />
                  </Button>
                  <Button variant="outline" className="aspect-square p-0" onClick={() => addIcon("award")}>
                    <Award className="h-6 w-6" />
                  </Button>
                  <Button variant="outline" className="aspect-square p-0" onClick={() => addIcon("zap")}>
                    <Zap className="h-6 w-6" />
                  </Button>
                  <Button variant="outline" className="aspect-square p-0" onClick={() => addIcon("droplet")}>
                    <Droplet className="h-6 w-6" />
                  </Button>
                </div>
                
              </TabsContent>

              <TabsContent value="image" className="p-4 border rounded-lg mt-2">
                <h3 className="font-medium mb-3">Images</h3>
                <div className="space-y-4">
                  <div className="flex flex-col gap-2">
                    <input
                      type="file"
                      id="image-upload"
                      accept="image/*"
                      onChange={handleImageUpload}
                      className="hidden"
                    />
                    <label htmlFor="image-upload">
                      <Button variant="outline" className="w-full gap-2" asChild>
                        <span>
                          <ImageIcon className="h-4 w-4" /> Upload Image
                        </span>
                      </Button>
                    </label>

                    {uploadError && <p className="text-sm text-red-500 mt-1">{uploadError}</p>}
                  </div>
                  <p className="text-sm text-gray-500">
                    For best results, use transparent PNG images. Images will be added to your canvas and can be resized
                    and positioned.
                  </p>
                </div>
              </TabsContent>
            </Tabs>

            <div className="p-4 border rounded-lg space-y-4">
              <h3 className="font-medium">Color & Style</h3>

              <div className="space-y-2">
                <Label>Fill Color</Label>
                <div className="flex gap-2">
                  <ColorPicker
                    color={fillColor}
                    onChange={(color) => {
                      setFillColor(color)
                      if (selectedObjectId) {
                        updateSelectedObject({ fill: color })
                      }
                    }}
                  />
                  <div className="flex-1">
                    <Input
                      type="text"
                      value={fillColor}
                      onChange={(e) => setFillColor(e.target.value)}
                      className="font-mono"
                    />
                  </div>
                </div>
              </div>

              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <Label>Stroke Width</Label>
                  <span className="text-sm">{strokeWidth}px</span>
                </div>
                <Slider
                  value={[strokeWidth]}
                  min={0}
                  max={20}
                  step={1}
                  onValueChange={(value) => {
                    setStrokeWidth(value[0])
                    if (selectedObjectId) {
                      updateSelectedObject({ strokeWidth: value[0] })
                    }
                  }}
                />
              </div>

              {strokeWidth > 0 && (
                <div className="space-y-2">
                  <Label>Stroke Color</Label>
                  <div className="flex gap-2">
                    <ColorPicker
                      color={strokeColor}
                      onChange={(color) => {
                        setStrokeColor(color)
                        if (selectedObjectId) {
                          updateSelectedObject({ stroke: color })
                        }
                      }}
                    />
                    <div className="flex-1">
                      <Input
                        type="text"
                        value={strokeColor}
                        onChange={(e) => setStrokeColor(e.target.value)}
                        className="font-mono"
                      />
                    </div>
                  </div>
                </div>
              )}

              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <Label>Opacity</Label>
                  <span className="text-sm">{opacity}%</span>
                </div>
                <Slider
                  value={[opacity]}
                  min={10}
                  max={100}
                  step={1}
                  onValueChange={(value) => {
                    setOpacity(value[0])
                    if (selectedObjectId) {
                      updateSelectedObject({ opacity: value[0] })
                    }
                  }}
                />
              </div>

              <div className="space-y-2">
                <div className="flex items-center">
                  <input
                    type="checkbox"
                    id="use-gradient"
                    checked={useGradient}
                    onChange={(e) => setUseGradient(e.target.checked)}
                    className="mr-2"
                  />
                  <Label htmlFor="use-gradient">Use Gradient</Label>
                </div>

                {useGradient && (
                  <div className="space-y-3 pl-6">
                    <div className="space-y-1">
                      <Label htmlFor="gradient-type">Gradient Type</Label>
                      <Select
                        value={gradientType}
                        onValueChange={(value: "linear" | "radial") => setGradientType(value)}
                      >
                        <SelectTrigger id="gradient-type">
                          <SelectValue placeholder="Gradient Type" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="linear">Linear</SelectItem>
                          <SelectItem value="radial">Radial</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>

                    <div className="space-y-1">
                      <Label>Start Color</Label>
                      <div className="flex gap-2">
                        <ColorPicker
                          color={gradientColors[0]}
                          onChange={(color) => {
                            const newColors = [...gradientColors]
                            newColors[0] = color
                            setGradientColors(newColors)
                          }}
                        />
                        <div className="flex-1">
                          <Input
                            type="text"
                            value={gradientColors[0]}
                            onChange={(e) => {
                              const newColors = [...gradientColors]
                              newColors[0] = e.target.value
                              setGradientColors(newColors)
                            }}
                            className="font-mono"
                          />
                        </div>
                      </div>
                    </div>

                    <div className="space-y-1">
                      <Label>End Color</Label>
                      <div className="flex gap-2">
                        <ColorPicker
                          color={gradientColors[1]}
                          onChange={(color) => {
                            const newColors = [...gradientColors]
                            newColors[1] = color
                            setGradientColors(newColors)
                          }}
                        />
                        <div className="flex-1">
                          <Input
                            type="text"
                            value={gradientColors[1]}
                            onChange={(e) => {
                              const newColors = [...gradientColors]
                              newColors[1] = e.target.value
                              setGradientColors(newColors)
                            }}
                            className="font-mono"
                          />
                        </div>
                      </div>
                    </div>

                    {gradientType === "linear" && (
                      <div className="space-y-1">
                        <div className="flex items-center justify-between">
                          <Label>Angle</Label>
                          <span className="text-sm">{gradientAngle}°</span>
                        </div>
                        <Slider
                          value={[gradientAngle]}
                          min={0}
                          max={360}
                          step={1}
                          onValueChange={(value) => setGradientAngle(value[0])}
                        />
                      </div>
                    )}

                    <Button
                      size="sm"
                      onClick={() => {
                        if (selectedObjectId) {
                          updateSelectedObject({
                            gradient: {
                              type: gradientType,
                              colors: [...gradientColors],
                              stops: [...gradientStops],
                              angle: gradientAngle,
                            },
                          })
                        }
                      }}
                    >
                      Apply Gradient
                    </Button>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Canvas */}
          <div className="flex flex-col items-center">
            <div className="flex justify-between w-full mb-4">
              <div className="flex gap-2">
                <Button variant="outline" size="sm" onClick={undo} disabled={historyIndex <= 0}>
                  <Undo className="h-4 w-4" />
                </Button>
                <Button variant="outline" size="sm" onClick={redo} disabled={historyIndex >= canvasHistory.length - 1}>
                  <Redo className="h-4 w-4" />
                </Button>
              </div>
              <div className="flex gap-2">
                
                <Button size="sm" onClick={downloadLogo} className="gap-1">
                  <Download className="h-4 w-4" /> PNG
                </Button>
              </div>
            </div>

            <div className="border rounded-lg shadow-sm bg-white">
              <canvas
                ref={canvasRef}
                width={500}
                height={500}
                onClick={handleCanvasClick}
                onMouseDown={handleDragStart}
                onMouseMove={handleDragMove}
                onMouseUp={handleDragEnd}
                onMouseLeave={handleDragEnd}
                className="cursor-pointer"
              />
            </div>

            <div className="mt-4 text-center text-sm text-gray-500">Click on objects to select them. Drag to move.</div>
          </div>

          {/* Right Panel - Object Properties */}
          <div className="space-y-6">
            <div className="p-4 border rounded-lg space-y-4">
              <h3 className="font-medium">Layers</h3>
              <div className="space-y-2 max-h-[200px] overflow-y-auto">
                {objects.length === 0 ? (
                  <p className="text-sm text-gray-500 text-center py-4">No objects yet</p>
                ) : (
                  objects.map((obj, index) => (
                    <div
                      key={obj.id}
                      className={`flex items-center p-2 rounded cursor-pointer ${obj.id === selectedObjectId ? "bg-primary/10" : "hover:bg-gray-100"}`}
                      onClick={() => setSelectedObjectId(obj.id)}
                    >
                      <Layers className="h-4 w-4 mr-2" />
                      <span className="text-sm">
                        {obj.type === "text"
                          ? `Text: ${obj.text?.substring(0, 15)}${obj.text && obj.text.length > 15 ? "..." : ""}`
                          : obj.type === "shape"
                            ? `Shape: ${obj.shape}`
                            : obj.type === "icon"
                              ? `Icon: ${obj.icon}`
                              : "Image"}
                      </span>
                    </div>
                  ))
                )}
              </div>

              {selectedObjectId && (
                <div className="flex gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    className="flex-1"
                    onClick={() => {
                      const index = objects.findIndex((obj) => obj.id === selectedObjectId)
                      if (index > 0) {
                        const newObjects = [...objects]
                        const temp = newObjects[index]
                        newObjects[index] = newObjects[index - 1]
                        newObjects[index - 1] = temp
                        setObjects(newObjects)
                        saveCanvasState()
                      }
                    }}
                    disabled={objects.findIndex((obj) => obj.id === selectedObjectId) <= 0}
                  >
                    <ArrowLeft className="h-4 w-4" />
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    className="flex-1"
                    onClick={() => {
                      const index = objects.findIndex((obj) => obj.id === selectedObjectId)
                      if (index < objects.length - 1) {
                        const newObjects = [...objects]
                        const temp = newObjects[index]
                        newObjects[index] = newObjects[index + 1]
                        newObjects[index + 1] = temp
                        setObjects(newObjects)
                        saveCanvasState()
                      }
                    }}
                    disabled={objects.findIndex((obj) => obj.id === selectedObjectId) >= objects.length - 1}
                  >
                    <ArrowLeft className="h-4 w-4 rotate-180" />
                  </Button>
                </div>
              )}
            </div>

            {selectedObject && (
              <div className="p-4 border rounded-lg space-y-4">
                <h3 className="font-medium">Object Properties</h3>

                <div className="grid grid-cols-2 gap-2">
                  <div className="space-y-1">
                    <Label htmlFor="obj-width">Width</Label>
                    <div className="flex items-center">
                      <Input
                        id="obj-width"
                        type="number"
                        value={Math.round(selectedObject.width)}
                        onChange={(e) => updateSelectedObject({ width: Number(e.target.value) })}
                        min={10}
                        max={500}
                      />
                      <span className="ml-1">px</span>
                    </div>
                  </div>
                  <div className="space-y-1">
                    <Label htmlFor="obj-height">Height</Label>
                    <div className="flex items-center">
                      <Input
                        id="obj-height"
                        type="number"
                        value={Math.round(selectedObject.height)}
                        onChange={(e) => updateSelectedObject({ height: Number(e.target.value) })}
                        min={10}
                        max={500}
                      />
                      <span className="ml-1">px</span>
                    </div>
                  </div>
                </div>

                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <Label>Rotation</Label>
                    <span className="text-sm">{selectedObject.rotation}°</span>
                  </div>
                  <Slider
                    value={[selectedObject.rotation]}
                    min={0}
                    max={360}
                    step={1}
                    onValueChange={(value) => updateSelectedObject({ rotation: value[0] })}
                  />
                </div>

                <Button variant="destructive" size="sm" onClick={deleteSelectedObject} className="w-full">
                  Delete Object
                </Button>
              </div>
            )}
          </div>
        </div>
      </main>
    </div>
  )
}
