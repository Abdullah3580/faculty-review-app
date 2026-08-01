content = open('src/app/faculty/[id]/page.tsx', 'r', encoding='utf-8').read()

old = '  return {\n  title,\n  description,\n  openGraph: {\n    title,\n    description,\n    type: "profile",\n    siteName: "Faculty Review App",\n    url: `${process.env.NEXT_PUBLIC_FRONTEND_URL}/faculty/${id}`,\n    images: faculty.image ? [{ url: faculty.image, width: 400, height: 400, alt: faculty.name }] : [],\n  },\n}\n  twitter: { card: "summary_large_image", title, description },\n};'

new = '  return {\n    title,\n    description,\n    openGraph: {\n      title,\n      description,\n      type: "profile",\n      siteName: "Faculty Review App",\n      url: `${process.env.NEXT_PUBLIC_FRONTEND_URL}/faculty/${id}`,\n      images: faculty.image ? [{ url: faculty.image, width: 400, height: 400, alt: faculty.name }] : [],\n    },\n    twitter: { card: "summary_large_image", title, description },\n  };\n}'

result = content.replace(old, new)
print('Changed:', content != result)
open('src/app/faculty/[id]/page.tsx', 'w', encoding='utf-8').write(result)
