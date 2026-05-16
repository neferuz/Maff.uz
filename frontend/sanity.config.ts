import { defineConfig } from 'sanity'
import { deskTool } from 'sanity/desk'
import { visionTool } from '@sanity/vision'
import { assist } from '@sanity/assist'
import { schemaTypes } from './src/sanity/schemas'

export default defineConfig({
  name: 'default',
  title: 'Maff CMS',

  projectId: process.env.NEXT_PUBLIC_SANITY_PROJECT_ID || 'pnevwao4',
  dataset: process.env.NEXT_PUBLIC_SANITY_DATASET || 'production',

  basePath: '/admin',

  plugins: [
    deskTool(),
    visionTool(),
    assist(),
  ],

  schema: {
    types: schemaTypes,
  },
})
