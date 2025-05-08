import Link from "next/link"
import Image from "next/image"
import { Button } from "@/components/ui/button"
import { ArrowRight, Package, Coffee, ShoppingBag, Box, Palette } from "lucide-react"
import TemplateCard from "@/components/template-card"

export default function Home() {
  const templates = [
    {
      id: "box",
      name: "Product Box",
      description: "Perfect for retail packaging",
      image: "/product-box.png?key=dlz0d",
      icon: Box,
    },
    {
      id: "cup",
      name: "Coffee Cup",
      description: "Ideal for cafes and beverages",
      image: "/cup.png?key=otyqj",
      icon: Coffee,
    },
    {
      id: "bag",
      name: "Shopping Bag",
      description: "Great for retail and fashion",
      image: "/bag.jpg?key=4ratd",
      icon: ShoppingBag,
    },
    {
      id: "container",
      name: "Food Container",
      description: "Perfect for restaurants and takeout",
      image: "/food-container.webp?key=8z6wr",
      icon: Package,
    },
  ]

  return (
    <main className="flex min-h-screen flex-col">
      {/* Hero Section */}
      <section className="w-full py-12 md:py-24 lg:py-32 xl:py-48 bg-gradient-to-b from-white to-gray-100">
        <div className="container px-4 md:px-6 mx-auto">
          <div className="grid gap-6 lg:grid-cols-[1fr_400px] lg:gap-12 xl:grid-cols-[1fr_600px]">
            <div className="flex flex-col justify-center space-y-4">
              <div className="space-y-2">
                <h1 className="text-3xl font-bold tracking-tighter sm:text-5xl xl:text-6xl/none">
                  See Your Logo on Packaging in Seconds
                </h1>
                <p className="max-w-[600px] text-gray-500 md:text-xl">
                  Upload your logo and instantly see how it looks on different packaging designs. Create professional
                  mockups for your brand with our easy-to-use editor.
                </p>
              </div>
              <div className="flex flex-col gap-2 min-[400px]:flex-row">
                <Link href="/editor">
                  <Button size="lg" className="gap-1.5">
                    Get Started <ArrowRight className="h-4 w-4" />
                  </Button>
                </Link>
                <Link href="#templates">
                  <Button size="lg" variant="outline">
                    Browse Templates
                  </Button>
                </Link>
              </div>
            </div>
            <div className="flex items-center justify-center">
              <div className="relative w-full max-w-[500px] aspect-square">
                <Image
                  src="/hero-section.png?key=9zdcr"
                  alt="Packaging mockup preview"
                  fill
                  className="object-contain"
                  priority
                />
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* How It Works Section */}
      <section className="w-full py-12 md:py-24 lg:py-32 bg-white">
        <div className="container px-4 md:px-6 mx-auto">
          <div className="flex flex-col items-center justify-center space-y-4 text-center">
            <div className="space-y-2">
              <h2 className="text-3xl font-bold tracking-tighter sm:text-4xl md:text-5xl">How It Works</h2>
              <p className="max-w-[700px] text-gray-500 md:text-xl/relaxed lg:text-base/relaxed xl:text-xl/relaxed">
                Create professional packaging mockups in three simple steps
              </p>
            </div>
          </div>
          <div className="mx-auto grid max-w-5xl items-center gap-6 py-12 lg:grid-cols-3">
            <div className="flex flex-col items-center space-y-4 rounded-lg border p-6 shadow-sm">
              <div className="flex h-12 w-12 items-center justify-center rounded-full bg-primary text-primary-foreground">
                1
              </div>
              <h3 className="text-xl font-bold">Choose a Template</h3>
              <p className="text-center text-gray-500">
                Browse our collection of packaging templates and select the one that fits your brand.
              </p>
            </div>
            <div className="flex flex-col items-center space-y-4 rounded-lg border p-6 shadow-sm">
              <div className="flex h-12 w-12 items-center justify-center rounded-full bg-primary text-primary-foreground">
                2
              </div>
              <h3 className="text-xl font-bold">Upload Your Logo</h3>
              <p className="text-center text-gray-500">
                Upload your logo or design and position it exactly where you want on the packaging.
              </p>
            </div>
            <div className="flex flex-col items-center space-y-4 rounded-lg border p-6 shadow-sm">
              <div className="flex h-12 w-12 items-center justify-center rounded-full bg-primary text-primary-foreground">
                3
              </div>
              <h3 className="text-xl font-bold">Download Your Mockup</h3>
              <p className="text-center text-gray-500">
                Save your design as a high-quality image ready to share with clients or use in presentations.
              </p>
            </div>
            <div className="flex flex-col items-center space-y-4 rounded-lg border p-6 shadow-sm">
              <div className="flex h-12 w-12 items-center justify-center rounded-full bg-primary text-primary-foreground">
                4
              </div>
              <h3 className="text-xl font-bold">Create Your Own Logo</h3>
              <p className="text-center text-gray-500">
                Need a logo? Use our built-in logo designer to create a custom logo for your packaging.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Templates Section */}
      <section id="templates" className="w-full py-12 md:py-24 lg:py-32 bg-gray-50">
        <div className="container px-4 md:px-6 mx-auto">
          <div className="flex flex-col items-center justify-center space-y-4 text-center">
            <div className="space-y-2">
              <h2 className="text-3xl font-bold tracking-tighter sm:text-4xl md:text-5xl">Browse Templates</h2>
              <p className="max-w-[700px] text-gray-500 md:text-xl/relaxed lg:text-base/relaxed xl:text-xl/relaxed">
                Choose from our collection of professional packaging templates
              </p>
            </div>
          </div>
          <div className="mx-auto grid max-w-5xl gap-6 py-12 md:grid-cols-2 lg:grid-cols-2">
            {templates.map((template) => (
              <TemplateCard
                key={template.id}
                id={template.id}
                name={template.name}
                description={template.description}
                image={template.image}
                Icon={template.icon}
              />
            ))}
          </div>
          <div className="flex justify-center">
            <Link href="/editor">
              <Button size="lg" className="gap-1.5">
                Start Designing <ArrowRight className="h-4 w-4" />
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="w-full py-12 md:py-24 lg:py-32 bg-white">
        <div className="container px-4 md:px-6 mx-auto">
          <div className="flex flex-col items-center justify-center space-y-4 text-center">
            <div className="space-y-2">
              <h2 className="text-3xl font-bold tracking-tighter sm:text-4xl md:text-5xl">Powerful Features</h2>
              <p className="max-w-[700px] text-gray-500 md:text-xl/relaxed lg:text-base/relaxed xl:text-xl/relaxed">
                Everything you need to create professional packaging mockups
              </p>
            </div>
          </div>
          <div className="mx-auto grid max-w-5xl gap-6 py-12 md:grid-cols-2 lg:grid-cols-3">
            <div className="flex flex-col space-y-2">
              <h3 className="text-xl font-bold">Drag & Drop Editor</h3>
              <p className="text-gray-500">Easily position your logo exactly where you want it on the packaging.</p>
            </div>
            <div className="flex flex-col space-y-2">
              <h3 className="text-xl font-bold">Resize & Rotate</h3>
              <p className="text-gray-500">Adjust the size and angle of your logo to get the perfect fit.</p>
            </div>
            <div className="flex flex-col space-y-2">
              <h3 className="text-xl font-bold">Multiple Templates</h3>
              <p className="text-gray-500">Choose from a variety of packaging templates for different products.</p>
            </div>
            <div className="flex flex-col space-y-2">
              <h3 className="text-xl font-bold">High-Quality Export</h3>
              <p className="text-gray-500">Download your designs in high resolution for professional use.</p>
            </div>
            <div className="flex flex-col space-y-2">
              <h3 className="text-xl font-bold">No Design Skills Needed</h3>
              <p className="text-gray-500">
                Our intuitive interface makes it easy for anyone to create professional mockups.
              </p>
            </div>
            <div className="flex flex-col space-y-2">
              <h3 className="text-xl font-bold">Instant Preview</h3>
              <p className="text-gray-500">See your changes in real-time as you edit your design.</p>
            </div>
            <div className="flex flex-col space-y-2">
              <h3 className="text-xl font-bold">Logo Designer</h3>
              <p className="text-gray-500">
                Create custom logos with our built-in designer featuring shapes, text, and colors.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="w-full py-12 md:py-24 lg:py-32 bg-primary text-primary-foreground">
        <div className="container px-4 md:px-6 mx-auto">
          <div className="flex flex-col items-center justify-center space-y-4 text-center">
            <div className="space-y-2">
              <h2 className="text-3xl font-bold tracking-tighter sm:text-4xl md:text-5xl">
                Ready to Create Your Mockups?
              </h2>
              <p className="max-w-[700px] md:text-xl/relaxed lg:text-base/relaxed xl:text-xl/relaxed">
                Start designing professional packaging mockups for your brand in seconds.
              </p>
            </div>
            <div className="flex flex-col gap-2 min-[400px]:flex-row">
              <Link href="/editor">
                <Button size="lg" variant="secondary" className="gap-1.5">
                  Get Started Now <ArrowRight className="h-4 w-4" />
                </Button>
              </Link>
              <Link href="/logo-designer">
                <Button size="lg" variant="outline" className="gap-1.5">
                  Try Logo Designer <Palette className="h-4 w-4" />
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="w-full py-6 bg-gray-100">
        <div className="container px-4 md:px-6 mx-auto">
          <div className="flex flex-col items-center justify-center space-y-4 text-center">
            <div className="flex items-center space-x-2">
              <Package className="h-6 w-6" />
              <span className="text-lg font-bold">VectorByte</span>
            </div>
            <p className="text-sm text-gray-500">© {new Date().getFullYear()} VectorByte. All rights reserved.</p>
          </div>
        </div>
      </footer>
    </main>
  )
}
