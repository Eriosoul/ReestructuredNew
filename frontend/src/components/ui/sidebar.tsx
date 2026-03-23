"use client"

import * as React from "react"
import { Slot } from "@radix-ui/react-slot"
import { cva, type VariantProps } from "class-variance-authority"
import { PanelLeftIcon } from "lucide-react"

import { useIsMobile } from "@/hooks/use-mobile"
import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Separator } from "@/components/ui/separator"
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet"
import { Skeleton } from "@/components/ui/skeleton"
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip"

const _COOKIE_NAME = "_state"
const _COOKIE_MAX_AGE = 60 * 60 * 24 * 7
const _WIDTH = "16rem"
const _WIDTH_MOBILE = "18rem"
const _WIDTH_ICON = "3rem"
const _KEYBOARD_SHORTCUT = "b"

type ContextProps = {
  state: "expanded" | "collapsed"
  open: boolean
  setOpen: (open: boolean) => void
  openMobile: boolean
  setOpenMobile: (open: boolean) => void
  isMobile: boolean
  toggle: () => void
}

const Context = React.createContext<ContextProps | null>(null)

function use() {
  const context = React.useContext(Context)
  if (!context) {
    throw new Error("use must be used within a Provider.")
  }

  return context
}

function Provider({
  defaultOpen = true,
  open: openProp,
  onOpenChange: setOpenProp,
  className,
  style,
  children,
  ...props
}: React.ComponentProps<"div"> & {
  defaultOpen?: boolean
  open?: boolean
  onOpenChange?: (open: boolean) => void
}) {
  const isMobile = useIsMobile()
  const [openMobile, setOpenMobile] = React.useState(false)

  // This is the internal state of the .
  // We use openProp and setOpenProp for control from outside the component.
  const [_open, _setOpen] = React.useState(defaultOpen)
  const open = openProp ?? _open
  const setOpen = React.useCallback(
    (value: boolean | ((value: boolean) => boolean)) => {
      const openState = typeof value === "function" ? value(open) : value
      if (setOpenProp) {
        setOpenProp(openState)
      } else {
        _setOpen(openState)
      }

      // This sets the cookie to keep the  state.
      document.cookie = `${_COOKIE_NAME}=${openState}; path=/; max-age=${_COOKIE_MAX_AGE}`
    },
    [setOpenProp, open]
  )

  // Helper to toggle the .
  const toggle = React.useCallback(() => {
    return isMobile ? setOpenMobile((open) => !open) : setOpen((open) => !open)
  }, [isMobile, setOpen, setOpenMobile])

  // Adds a keyboard shortcut to toggle the .
  React.useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (
        event.key === _KEYBOARD_SHORTCUT &&
        (event.metaKey || event.ctrlKey)
      ) {
        event.preventDefault()
        toggle()
      }
    }

    window.addEventListener("keydown", handleKeyDown)
    return () => window.removeEventListener("keydown", handleKeyDown)
  }, [toggle])

  // We add a state so that we can do data-state="expanded" or "collapsed".
  // This makes it easier to style the  with Tailwind classes.
  const state = open ? "expanded" : "collapsed"

  const contextValue = React.useMemo<ContextProps>(
    () => ({
      state,
      open,
      setOpen,
      isMobile,
      openMobile,
      setOpenMobile,
      toggle,
    }),
    [state, open, setOpen, isMobile, openMobile, setOpenMobile, toggle]
  )

  return (
    <Context.Provider value={contextValue}>
      <TooltipProvider delayDuration={0}>
        <div
          data-slot="-wrapper"
          style={
            {
              "---width": _WIDTH,
              "---width-icon": _WIDTH_ICON,
              ...style,
            } as React.CSSProperties
          }
          className={cn(
            "group/-wrapper has-data-[variant=inset]:bg- flex min-h-svh w-full",
            className
          )}
          {...props}
        >
          {children}
        </div>
      </TooltipProvider>
    </Context.Provider>
  )
}

function ({
  side = "left",
  variant = "",
  collapsible = "offcanvas",
  className,
  children,
  ...props
}: React.ComponentProps<"div"> & {
  side?: "left" | "right"
  variant?: "" | "floating" | "inset"
  collapsible?: "offcanvas" | "icon" | "none"
}) {
  const { isMobile, state, openMobile, setOpenMobile } = use()

  if (collapsible === "none") {
    return (
      <div
        data-slot=""
        className={cn(
          "bg- text--foreground flex h-full w-(---width) flex-col",
          className
        )}
        {...props}
      >
        {children}
      </div>
    )
  }

  if (isMobile) {
    return (
      <Sheet open={openMobile} onOpenChange={setOpenMobile} {...props}>
        <SheetContent
          data-=""
          data-slot=""
          data-mobile="true"
          className="bg- text--foreground w-(---width) p-0 [&>button]:hidden"
          style={
            {
              "---width": _WIDTH_MOBILE,
            } as React.CSSProperties
          }
          side={side}
        >
          <SheetHeader className="sr-only">
            <SheetTitle></SheetTitle>
            <SheetDescription>Displays the mobile .</SheetDescription>
          </SheetHeader>
          <div className="flex h-full w-full flex-col">{children}</div>
        </SheetContent>
      </Sheet>
    )
  }

  return (
    <div
      className="group peer text--foreground hidden md:block"
      data-state={state}
      data-collapsible={state === "collapsed" ? collapsible : ""}
      data-variant={variant}
      data-side={side}
      data-slot=""
    >
      {/* This is what handles the  gap on desktop */}
      <div
        data-slot="-gap"
        className={cn(
          "relative w-(---width) bg-transparent transition-[width] duration-200 ease-linear",
          "group-data-[collapsible=offcanvas]:w-0",
          "group-data-[side=right]:rotate-180",
          variant === "floating" || variant === "inset"
            ? "group-data-[collapsible=icon]:w-[calc(var(---width-icon)+(--spacing(4)))]"
            : "group-data-[collapsible=icon]:w-(---width-icon)"
        )}
      />
      <div
        data-slot="-container"
        className={cn(
          "fixed inset-y-0 z-10 hidden h-svh w-(---width) transition-[left,right,width] duration-200 ease-linear md:flex",
          side === "left"
            ? "left-0 group-data-[collapsible=offcanvas]:left-[calc(var(---width)*-1)]"
            : "right-0 group-data-[collapsible=offcanvas]:right-[calc(var(---width)*-1)]",
          // Adjust the padding for floating and inset variants.
          variant === "floating" || variant === "inset"
            ? "p-2 group-data-[collapsible=icon]:w-[calc(var(---width-icon)+(--spacing(4))+2px)]"
            : "group-data-[collapsible=icon]:w-(---width-icon) group-data-[side=left]:border-r group-data-[side=right]:border-l",
          className
        )}
        {...props}
      >
        <div
          data-=""
          data-slot="-inner"
          className="bg- group-data-[variant=floating]:border--border flex h-full w-full flex-col group-data-[variant=floating]:rounded-lg group-data-[variant=floating]:border group-data-[variant=floating]:shadow-sm"
        >
          {children}
        </div>
      </div>
    </div>
  )
}

function Trigger({
  className,
  onClick,
  ...props
}: React.ComponentProps<typeof Button>) {
  const { toggle } = use()

  return (
    <Button
      data-="trigger"
      data-slot="-trigger"
      variant="ghost"
      size="icon"
      className={cn("size-7", className)}
      onClick={(event) => {
        onClick?.(event)
        toggle()
      }}
      {...props}
    >
      <PanelLeftIcon />
      <span className="sr-only">Toggle </span>
    </Button>
  )
}

function Rail({ className, ...props }: React.ComponentProps<"button">) {
  const { toggle } = use()

  return (
    <button
      data-="rail"
      data-slot="-rail"
      aria-label="Toggle "
      tabIndex={-1}
      onClick={toggle}
      title="Toggle "
      className={cn(
        "hover:after:bg--border absolute inset-y-0 z-20 hidden w-4 -translate-x-1/2 transition-all ease-linear group-data-[side=left]:-right-4 group-data-[side=right]:left-0 after:absolute after:inset-y-0 after:left-1/2 after:w-[2px] sm:flex",
        "in-data-[side=left]:cursor-w-resize in-data-[side=right]:cursor-e-resize",
        "[[data-side=left][data-state=collapsed]_&]:cursor-e-resize [[data-side=right][data-state=collapsed]_&]:cursor-w-resize",
        "hover:group-data-[collapsible=offcanvas]:bg- group-data-[collapsible=offcanvas]:translate-x-0 group-data-[collapsible=offcanvas]:after:left-full",
        "[[data-side=left][data-collapsible=offcanvas]_&]:-right-2",
        "[[data-side=right][data-collapsible=offcanvas]_&]:-left-2",
        className
      )}
      {...props}
    />
  )
}

function Inset({ className, ...props }: React.ComponentProps<"main">) {
  return (
    <main
      data-slot="-inset"
      className={cn(
        "bg-background relative flex w-full flex-1 flex-col",
        "md:peer-data-[variant=inset]:m-2 md:peer-data-[variant=inset]:ml-0 md:peer-data-[variant=inset]:rounded-xl md:peer-data-[variant=inset]:shadow-sm md:peer-data-[variant=inset]:peer-data-[state=collapsed]:ml-2",
        className
      )}
      {...props}
    />
  )
}

function Input({
  className,
  ...props
}: React.ComponentProps<typeof Input>) {
  return (
    <Input
      data-slot="-input"
      data-="input"
      className={cn("bg-background h-8 w-full shadow-none", className)}
      {...props}
    />
  )
}

function Header({ className, ...props }: React.ComponentProps<"div">) {
  return (
    <div
      data-slot="-header"
      data-="header"
      className={cn("flex flex-col gap-2 p-2", className)}
      {...props}
    />
  )
}

function Footer({ className, ...props }: React.ComponentProps<"div">) {
  return (
    <div
      data-slot="-footer"
      data-="footer"
      className={cn("flex flex-col gap-2 p-2", className)}
      {...props}
    />
  )
}

function Separator({
  className,
  ...props
}: React.ComponentProps<typeof Separator>) {
  return (
    <Separator
      data-slot="-separator"
      data-="separator"
      className={cn("bg--border mx-2 w-auto", className)}
      {...props}
    />
  )
}

function Content({ className, ...props }: React.ComponentProps<"div">) {
  return (
    <div
      data-slot="-content"
      data-="content"
      className={cn(
        "flex min-h-0 flex-1 flex-col gap-2 overflow-auto group-data-[collapsible=icon]:overflow-hidden",
        className
      )}
      {...props}
    />
  )
}

function Group({ className, ...props }: React.ComponentProps<"div">) {
  return (
    <div
      data-slot="-group"
      data-="group"
      className={cn("relative flex w-full min-w-0 flex-col p-2", className)}
      {...props}
    />
  )
}

function GroupLabel({
  className,
  asChild = false,
  ...props
}: React.ComponentProps<"div"> & { asChild?: boolean }) {
  const Comp = asChild ? Slot : "div"

  return (
    <Comp
      data-slot="-group-label"
      data-="group-label"
      className={cn(
        "text--foreground/70 ring--ring flex h-8 shrink-0 items-center rounded-md px-2 text-xs font-medium outline-hidden transition-[margin,opacity] duration-200 ease-linear focus-visible:ring-2 [&>svg]:size-4 [&>svg]:shrink-0",
        "group-data-[collapsible=icon]:-mt-8 group-data-[collapsible=icon]:opacity-0",
        className
      )}
      {...props}
    />
  )
}

function GroupAction({
  className,
  asChild = false,
  ...props
}: React.ComponentProps<"button"> & { asChild?: boolean }) {
  const Comp = asChild ? Slot : "button"

  return (
    <Comp
      data-slot="-group-action"
      data-="group-action"
      className={cn(
        "text--foreground ring--ring hover:bg--accent hover:text--accent-foreground absolute top-3.5 right-3 flex aspect-square w-5 items-center justify-center rounded-md p-0 outline-hidden transition-transform focus-visible:ring-2 [&>svg]:size-4 [&>svg]:shrink-0",
        // Increases the hit area of the button on mobile.
        "after:absolute after:-inset-2 md:after:hidden",
        "group-data-[collapsible=icon]:hidden",
        className
      )}
      {...props}
    />
  )
}

function GroupContent({
  className,
  ...props
}: React.ComponentProps<"div">) {
  return (
    <div
      data-slot="-group-content"
      data-="group-content"
      className={cn("w-full text-sm", className)}
      {...props}
    />
  )
}

function Menu({ className, ...props }: React.ComponentProps<"ul">) {
  return (
    <ul
      data-slot="-menu"
      data-="menu"
      className={cn("flex w-full min-w-0 flex-col gap-1", className)}
      {...props}
    />
  )
}

function MenuItem({ className, ...props }: React.ComponentProps<"li">) {
  return (
    <li
      data-slot="-menu-item"
      data-="menu-item"
      className={cn("group/menu-item relative", className)}
      {...props}
    />
  )
}

const MenuButtonVariants = cva(
  "peer/menu-button flex w-full items-center gap-2 overflow-hidden rounded-md p-2 text-left text-sm outline-hidden ring--ring transition-[width,height,padding] hover:bg--accent hover:text--accent-foreground focus-visible:ring-2 active:bg--accent active:text--accent-foreground disabled:pointer-events-none disabled:opacity-50 group-has-data-[=menu-action]/menu-item:pr-8 aria-disabled:pointer-events-none aria-disabled:opacity-50 data-[active=true]:bg--accent data-[active=true]:font-medium data-[active=true]:text--accent-foreground data-[state=open]:hover:bg--accent data-[state=open]:hover:text--accent-foreground group-data-[collapsible=icon]:size-8! group-data-[collapsible=icon]:p-2! [&>span:last-child]:truncate [&>svg]:size-4 [&>svg]:shrink-0",
  {
    variants: {
      variant: {
        default: "hover:bg--accent hover:text--accent-foreground",
        outline:
          "bg-background shadow-[0_0_0_1px_hsl(var(---border))] hover:bg--accent hover:text--accent-foreground hover:shadow-[0_0_0_1px_hsl(var(---accent))]",
      },
      size: {
        default: "h-8 text-sm",
        sm: "h-7 text-xs",
        lg: "h-12 text-sm group-data-[collapsible=icon]:p-0!",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "default",
    },
  }
)

function MenuButton({
  asChild = false,
  isActive = false,
  variant = "default",
  size = "default",
  tooltip,
  className,
  ...props
}: React.ComponentProps<"button"> & {
  asChild?: boolean
  isActive?: boolean
  tooltip?: string | React.ComponentProps<typeof TooltipContent>
} & VariantProps<typeof MenuButtonVariants>) {
  const Comp = asChild ? Slot : "button"
  const { isMobile, state } = use()

  const button = (
    <Comp
      data-slot="-menu-button"
      data-="menu-button"
      data-size={size}
      data-active={isActive}
      className={cn(MenuButtonVariants({ variant, size }), className)}
      {...props}
    />
  )

  if (!tooltip) {
    return button
  }

  if (typeof tooltip === "string") {
    tooltip = {
      children: tooltip,
    }
  }

  return (
    <Tooltip>
      <TooltipTrigger asChild>{button}</TooltipTrigger>
      <TooltipContent
        side="right"
        align="center"
        hidden={state !== "collapsed" || isMobile}
        {...tooltip}
      />
    </Tooltip>
  )
}

function MenuAction({
  className,
  asChild = false,
  showOnHover = false,
  ...props
}: React.ComponentProps<"button"> & {
  asChild?: boolean
  showOnHover?: boolean
}) {
  const Comp = asChild ? Slot : "button"

  return (
    <Comp
      data-slot="-menu-action"
      data-="menu-action"
      className={cn(
        "text--foreground ring--ring hover:bg--accent hover:text--accent-foreground peer-hover/menu-button:text--accent-foreground absolute top-1.5 right-1 flex aspect-square w-5 items-center justify-center rounded-md p-0 outline-hidden transition-transform focus-visible:ring-2 [&>svg]:size-4 [&>svg]:shrink-0",
        // Increases the hit area of the button on mobile.
        "after:absolute after:-inset-2 md:after:hidden",
        "peer-data-[size=sm]/menu-button:top-1",
        "peer-data-[size=default]/menu-button:top-1.5",
        "peer-data-[size=lg]/menu-button:top-2.5",
        "group-data-[collapsible=icon]:hidden",
        showOnHover &&
          "peer-data-[active=true]/menu-button:text--accent-foreground group-focus-within/menu-item:opacity-100 group-hover/menu-item:opacity-100 data-[state=open]:opacity-100 md:opacity-0",
        className
      )}
      {...props}
    />
  )
}

function MenuBadge({
  className,
  ...props
}: React.ComponentProps<"div">) {
  return (
    <div
      data-slot="-menu-badge"
      data-="menu-badge"
      className={cn(
        "text--foreground pointer-events-none absolute right-1 flex h-5 min-w-5 items-center justify-center rounded-md px-1 text-xs font-medium tabular-nums select-none",
        "peer-hover/menu-button:text--accent-foreground peer-data-[active=true]/menu-button:text--accent-foreground",
        "peer-data-[size=sm]/menu-button:top-1",
        "peer-data-[size=default]/menu-button:top-1.5",
        "peer-data-[size=lg]/menu-button:top-2.5",
        "group-data-[collapsible=icon]:hidden",
        className
      )}
      {...props}
    />
  )
}

function MenuSkeleton({
  className,
  showIcon = false,
  ...props
}: React.ComponentProps<"div"> & {
  showIcon?: boolean
}) {
  // Random width between 50 to 90%.
  const width = React.useMemo(() => {
    return `${Math.floor(Math.random() * 40) + 50}%`
  }, [])

  return (
    <div
      data-slot="-menu-skeleton"
      data-="menu-skeleton"
      className={cn("flex h-8 items-center gap-2 rounded-md px-2", className)}
      {...props}
    >
      {showIcon && (
        <Skeleton
          className="size-4 rounded-md"
          data-="menu-skeleton-icon"
        />
      )}
      <Skeleton
        className="h-4 max-w-(--skeleton-width) flex-1"
        data-="menu-skeleton-text"
        style={
          {
            "--skeleton-width": width,
          } as React.CSSProperties
        }
      />
    </div>
  )
}

function MenuSub({ className, ...props }: React.ComponentProps<"ul">) {
  return (
    <ul
      data-slot="-menu-sub"
      data-="menu-sub"
      className={cn(
        "border--border mx-3.5 flex min-w-0 translate-x-px flex-col gap-1 border-l px-2.5 py-0.5",
        "group-data-[collapsible=icon]:hidden",
        className
      )}
      {...props}
    />
  )
}

function MenuSubItem({
  className,
  ...props
}: React.ComponentProps<"li">) {
  return (
    <li
      data-slot="-menu-sub-item"
      data-="menu-sub-item"
      className={cn("group/menu-sub-item relative", className)}
      {...props}
    />
  )
}

function MenuSubButton({
  asChild = false,
  size = "md",
  isActive = false,
  className,
  ...props
}: React.ComponentProps<"a"> & {
  asChild?: boolean
  size?: "sm" | "md"
  isActive?: boolean
}) {
  const Comp = asChild ? Slot : "a"

  return (
    <Comp
      data-slot="-menu-sub-button"
      data-="menu-sub-button"
      data-size={size}
      data-active={isActive}
      className={cn(
        "text--foreground ring--ring hover:bg--accent hover:text--accent-foreground active:bg--accent active:text--accent-foreground [&>svg]:text--accent-foreground flex h-7 min-w-0 -translate-x-px items-center gap-2 overflow-hidden rounded-md px-2 outline-hidden focus-visible:ring-2 disabled:pointer-events-none disabled:opacity-50 aria-disabled:pointer-events-none aria-disabled:opacity-50 [&>span:last-child]:truncate [&>svg]:size-4 [&>svg]:shrink-0",
        "data-[active=true]:bg--accent data-[active=true]:text--accent-foreground",
        size === "sm" && "text-xs",
        size === "md" && "text-sm",
        "group-data-[collapsible=icon]:hidden",
        className
      )}
      {...props}
    />
  )
}

export {
  ,
  Content,
  Footer,
  Group,
  GroupAction,
  GroupContent,
  GroupLabel,
  Header,
  Input,
  Inset,
  Menu,
  MenuAction,
  MenuBadge,
  MenuButton,
  MenuItem,
  MenuSkeleton,
  MenuSub,
  MenuSubButton,
  MenuSubItem,
  Provider,
  Rail,
  Separator,
  Trigger,
  use,
}
