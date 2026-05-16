export default {
  name: 'page',
  title: 'Страницы',
  type: 'document',
  fields: [
    {
      name: 'title',
      title: 'Заголовок',
      type: 'string',
    },
    {
      name: 'slug',
      title: 'URL (Slug)',
      type: 'slug',
      options: {
        source: 'title',
        maxLength: 96,
      },
    },
    {
      name: 'hero',
      title: 'Главный блок (Hero)',
      type: 'object',
      fields: [
        { name: 'title', title: 'Заголовок', type: 'string' },
        { name: 'description', title: 'Описание', type: 'text' },
      ]
    },
    {
      name: 'stats',
      title: 'Статистика',
      type: 'array',
      of: [
        {
          type: 'object',
          fields: [
            { name: 'label', title: 'Название', type: 'string' },
            { name: 'value', title: 'Значение', type: 'string' },
            { name: 'icon', title: 'Иконка (имя из Lucide)', type: 'string' },
          ]
        }
      ]
    },
    {
      name: 'values',
      title: 'Наши ценности / Преимущества',
      type: 'array',
      of: [
        {
          type: 'object',
          fields: [
            { name: 'title', title: 'Заголовок', type: 'string' },
            { name: 'description', title: 'Описание', type: 'text' },
            { name: 'icon', title: 'Иконка (имя из Lucide)', type: 'string' },
          ]
        }
      ]
    },
    {
      name: 'milestones',
      title: 'История (Timeline)',
      type: 'array',
      of: [
        {
          type: 'object',
          fields: [
            { name: 'year', title: 'Год', type: 'string' },
            { name: 'event', title: 'Событие', type: 'string' },
          ]
        }
      ]
    },
    {
      name: 'language',
      type: 'string',
      readOnly: true,
      hidden: true,
    },
  ],
}
