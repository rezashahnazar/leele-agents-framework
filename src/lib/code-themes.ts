import { themes } from "prism-react-renderer";

export const lightTheme = {
  ...themes.vsLight,
  plain: {
    color: "hsl(var(--foreground))",
    backgroundColor: "transparent",
  },
  styles: [
    ...themes.vsLight.styles,
    {
      types: ["comment", "prolog", "doctype", "cdata"],
      style: {
        color: "hsl(var(--muted-foreground))",
        fontStyle: "italic",
      },
    },
    {
      types: ["namespace"],
      style: {
        opacity: 0.7,
      },
    },
    {
      types: ["string", "attr-value"],
      style: {
        color: "hsl(var(--success, 142 76% 36%))",
      },
    },
    {
      types: ["punctuation", "operator"],
      style: {
        color: "hsl(var(--foreground))",
      },
    },
    {
      types: [
        "entity",
        "url",
        "symbol",
        "number",
        "boolean",
        "variable",
        "constant",
        "property",
        "regex",
        "inserted",
      ],
      style: {
        color: "hsl(var(--warning, 38 92% 50%))",
      },
    },
    {
      types: ["atrule", "keyword", "attr-name", "selector"],
      style: {
        color: "hsl(var(--primary))",
      },
    },
    {
      types: ["function", "deleted", "tag"],
      style: {
        color: "hsl(var(--destructive))",
      },
    },
    {
      types: ["function-variable"],
      style: {
        color: "hsl(var(--primary))",
      },
    },
    {
      types: ["tag", "selector", "keyword"],
      style: {
        color: "hsl(var(--info, 221 83% 53%))",
      },
    },
  ],
};

export const darkTheme = {
  ...themes.vsDark,
  plain: {
    color: "hsl(var(--foreground))",
    backgroundColor: "transparent",
  },
  styles: [
    ...themes.vsDark.styles,
    {
      types: ["comment", "prolog", "doctype", "cdata"],
      style: {
        color: "hsl(var(--muted-foreground))",
        fontStyle: "italic",
      },
    },
    {
      types: ["namespace"],
      style: {
        opacity: 0.7,
      },
    },
    {
      types: ["string", "attr-value"],
      style: {
        color: "hsl(var(--success, 142 76% 36%))",
      },
    },
    {
      types: ["punctuation", "operator"],
      style: {
        color: "hsl(var(--foreground))",
      },
    },
    {
      types: [
        "entity",
        "url",
        "symbol",
        "number",
        "boolean",
        "variable",
        "constant",
        "property",
        "regex",
        "inserted",
      ],
      style: {
        color: "hsl(var(--warning, 38 92% 50%))",
      },
    },
    {
      types: ["atrule", "keyword", "attr-name", "selector"],
      style: {
        color: "hsl(var(--primary))",
      },
    },
    {
      types: ["function", "deleted", "tag"],
      style: {
        color: "hsl(var(--destructive))",
      },
    },
    {
      types: ["function-variable"],
      style: {
        color: "hsl(var(--primary))",
      },
    },
    {
      types: ["tag", "selector", "keyword"],
      style: {
        color: "hsl(var(--info, 221 83% 53%))",
      },
    },
  ],
};
