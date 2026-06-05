"use client"

import { useState } from "react"
import { Menu, X } from "lucide-react"
import { Button } from "@/components/ui/button"
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet"
import { ThemeSwitch } from "@/components/switches/theme-switch"
import { LocaleSwitch } from "@/components/switches/locale-switch"
import { useTranslations } from "next-intl"
import { HomeLink } from "../home-page/home-link"

export function ControlsDrawer() {
  const [open, setOpen] = useState(false)
  const t = useTranslations("controls-drawer")

  return (
    <>
      {/* Mobile: single hamburger that opens a drawer */}
      <div className="sm:hidden">
        <Sheet open={open} onOpenChange={setOpen}>
          <SheetTrigger asChild>
            <Button variant="outline" size="icon" aria-label={t("open")}>
              {open ? (
                <X className="h-[1.2rem] w-[1.2rem]" />
              ) : (
                <Menu className="h-[1.2rem] w-[1.2rem]" />
              )}
            </Button>
          </SheetTrigger>
          <SheetContent side="left" className="w-56 p-6"
          onOpenAutoFocus={(event) => event.preventDefault()}>
            <SheetHeader className="mb-6">
              <SheetTitle>{t("title")}</SheetTitle>
            </SheetHeader>
            <div className="flex flex-col gap-4">
              {/* Each row: icon button + label */}
              <div className="flex items-center gap-3">
                <HomeLink />
                <span className="text-sm text-muted-foreground">{t("home")}</span>
              </div>
              <div className="flex items-center gap-3">
                <ThemeSwitch />
                <span className="text-sm text-muted-foreground">{t("theme")}</span>
              </div>
              <div className="flex items-center gap-3">
                <LocaleSwitch />
                <span className="text-sm text-muted-foreground">{t("language")}</span>
              </div>
            </div>
          </SheetContent>
        </Sheet>
      </div>

      {/* Desktop: render switches directly, side by side */}
      <div className="hidden sm:flex sm:flex-col lg:flex-row lg:gap-2">
        <HomeLink />
        <ThemeSwitch />
        <LocaleSwitch />
      </div>
    </>
  )
}