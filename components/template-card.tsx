import Link from "next/link"
import Image from "next/image"
import { Button } from "@/components/ui/button"
import { Card, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import type { LucideIcon } from "lucide-react"

interface TemplateCardProps {
  id: string
  name: string
  description: string
  image: string
  Icon: LucideIcon
}

export default function TemplateCard({ id, name, description, image, Icon }: TemplateCardProps) {
  return (
    <Card className="overflow-hidden">
      <div className="relative aspect-video w-full">
        <Image
          src={image || "/placeholder.svg"}
          alt={name}
          fill
          className=" transition-all hover:scale-105"
        />
      </div>
      <CardHeader>
        <div className="flex items-center gap-2">
          <Icon className="h-5 w-5" />
          <CardTitle>{name}</CardTitle>
        </div>
        <CardDescription>{description}</CardDescription>
      </CardHeader>
      <CardFooter>
        <Link href={`/editor?template=${id}`} className="w-full">
          <Button className="w-full">Use This Template</Button>
        </Link>
      </CardFooter>
    </Card>
  )
}
