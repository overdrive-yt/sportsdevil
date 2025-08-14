import { PrismaClient, AttributeType } from '@prisma/client'

const prisma = new PrismaClient()

async function seedAttributes() {
  console.log('🏏 Starting cricket attributes seeding...')

  // Create categories first
  const batsCategory = await prisma.category.upsert({
    where: { slug: 'cricket-bats' },
    update: {},
    create: {
      name: 'Cricket Bats',
      slug: 'cricket-bats',
      description: 'Professional cricket bats for all skill levels',
      isActive: true,
      sortOrder: 1,
    },
  })

  const protectionCategory = await prisma.category.upsert({
    where: { slug: 'protection' },
    update: {},
    create: {
      name: 'Protection',
      slug: 'protection',
      description: 'Cricket protection gear and equipment',
      isActive: true,
      sortOrder: 2,
    },
  })

  const wicketKeepingCategory = await prisma.category.upsert({
    where: { slug: 'wicket-keeping' },
    update: {},
    create: {
      name: 'Wicket Keeping',
      slug: 'wicket-keeping',
      description: 'Wicket keeping equipment and gear',
      isActive: true,
      sortOrder: 3,
    },
  })

  const juniorCategory = await prisma.category.upsert({
    where: { slug: 'junior-stock' },
    update: {},
    create: {
      name: 'Junior Stock',
      slug: 'junior-stock',
      description: 'Cricket equipment for junior players',
      isActive: true,
      sortOrder: 4,
    },
  })

  // Create brand categories
  const brandCategories = [
    'bas', 'bdm', 'ceat', 'dsc', 'gm', 'gray-nicolls', 'kg', 'mrf', 
    'nb', 'rns', 'sf', 'sg', 'ss-single-s', 'ss'
  ]

  for (const brand of brandCategories) {
    await prisma.category.upsert({
      where: { slug: brand },
      update: {},
      create: {
        name: brand.toUpperCase().replace('-', ' '),
        slug: brand,
        description: `${brand.toUpperCase()} cricket equipment`,
        isActive: true,
        sortOrder: 10,
      },
    })
  }

  // Cricket Bat Attributes
  const batAttributes = [
    {
      name: 'Bat Size',
      slug: 'bat-size',
      type: AttributeType.SELECT,
      options: JSON.stringify([
        'Short Handle', 'Long Handle', 'Size 1', 'Size 2', 'Size 3', 
        'Size 4', 'Size 5', 'Size 6', 'Harrow', 'Academy'
      ]),
      isRequired: true,
      sortOrder: 1,
      categoryId: batsCategory.id,
    },
    {
      name: 'Grade',
      slug: 'grade',
      type: AttributeType.SELECT,
      options: JSON.stringify(['Grade 1', 'Grade 2', 'Grade 3', 'Grade 4']),
      isRequired: true,
      sortOrder: 2,
      categoryId: batsCategory.id,
    },
    {
      name: 'Weight',
      slug: 'weight',
      type: AttributeType.SELECT,
      options: JSON.stringify([
        '2lb 6oz', '2lb 7oz', '2lb 8oz', '2lb 9oz', '2lb 10oz', 
        '2lb 11oz', '2lb 12oz', '2lb 13oz', '3lb', '3lb 1oz', '3lb 2oz'
      ]),
      isRequired: false,
      sortOrder: 3,
      categoryId: batsCategory.id,
    },
    {
      name: 'Hand',
      slug: 'hand',
      type: AttributeType.SELECT,
      options: JSON.stringify(['Right Hand', 'Left Hand']),
      isRequired: true,
      sortOrder: 4,
      categoryId: batsCategory.id,
    },
    {
      name: 'Toe',
      slug: 'toe',
      type: AttributeType.SELECT,
      options: JSON.stringify(['Round', 'Square', 'Oval']),
      isRequired: false,
      sortOrder: 5,
      categoryId: batsCategory.id,
    },
    {
      name: 'Spine',
      slug: 'spine',
      type: AttributeType.SELECT,
      options: JSON.stringify(['Low', 'Mid', 'High']),
      isRequired: false,
      sortOrder: 6,
      categoryId: batsCategory.id,
    },
    {
      name: 'Edge',
      slug: 'edge',
      type: AttributeType.SELECT,
      options: JSON.stringify(['36mm', '37mm', '38mm', '39mm', '40mm', '41mm', '42mm']),
      isRequired: false,
      sortOrder: 7,
      categoryId: batsCategory.id,
    },
  ]

  // Protection Gear Attributes
  const protectionAttributes = [
    {
      name: 'Size',
      slug: 'size',
      type: AttributeType.SELECT,
      options: JSON.stringify(['XS', 'S', 'M', 'L', 'XL', 'XXL']),
      isRequired: true,
      sortOrder: 1,
      categoryId: protectionCategory.id,
    },
    {
      name: 'Hand',
      slug: 'hand-protection',
      type: AttributeType.SELECT,
      options: JSON.stringify(['Right Hand', 'Left Hand', 'Ambidextrous']),
      isRequired: false,
      sortOrder: 2,
      categoryId: protectionCategory.id,
    },
    {
      name: 'Grade',
      slug: 'protection-grade',
      type: AttributeType.SELECT,
      options: JSON.stringify(['Club', 'County', 'International']),
      isRequired: false,
      sortOrder: 3,
      categoryId: protectionCategory.id,
    },
    {
      name: 'Color',
      slug: 'color',
      type: AttributeType.MULTISELECT,
      options: JSON.stringify(['White', 'Black', 'Navy', 'Red', 'Blue', 'Green']),
      isRequired: false,
      sortOrder: 4,
      categoryId: protectionCategory.id,
    },
  ]

  // Wicket Keeping Attributes
  const wicketKeepingAttributes = [
    {
      name: 'Size',
      slug: 'wk-size',
      type: AttributeType.SELECT,
      options: JSON.stringify(['S', 'M', 'L', 'XL']),
      isRequired: true,
      sortOrder: 1,
      categoryId: wicketKeepingCategory.id,
    },
    {
      name: 'Grade',
      slug: 'wk-grade',
      type: AttributeType.SELECT,
      options: JSON.stringify(['Club', 'County', 'International']),
      isRequired: false,
      sortOrder: 2,
      categoryId: wicketKeepingCategory.id,
    },
    {
      name: 'Color',
      slug: 'wk-color',
      type: AttributeType.SELECT,
      options: JSON.stringify(['White', 'Black', 'Navy']),
      isRequired: false,
      sortOrder: 3,
      categoryId: wicketKeepingCategory.id,
    },
    {
      name: 'Style',
      slug: 'wk-style',
      type: AttributeType.SELECT,
      options: JSON.stringify(['Traditional', 'Modern']),
      isRequired: false,
      sortOrder: 4,
      categoryId: wicketKeepingCategory.id,
    },
  ]

  // Junior Equipment Attributes
  const juniorAttributes = [
    {
      name: 'Age Group',
      slug: 'age-group',
      type: AttributeType.SELECT,
      options: JSON.stringify(['Under 8', 'Under 10', 'Under 12', 'Under 14', 'Under 16']),
      isRequired: true,
      sortOrder: 1,
      categoryId: juniorCategory.id,
    },
    {
      name: 'Size',
      slug: 'junior-size',
      type: AttributeType.SELECT,
      options: JSON.stringify(['Size 1', 'Size 2', 'Size 3', 'Size 4', 'Size 5', 'Size 6']),
      isRequired: true,
      sortOrder: 2,
      categoryId: juniorCategory.id,
    },
    {
      name: 'Hand',
      slug: 'junior-hand',
      type: AttributeType.SELECT,
      options: JSON.stringify(['Right Hand', 'Left Hand']),
      isRequired: true,
      sortOrder: 3,
      categoryId: juniorCategory.id,
    },
  ]

  // Create all attributes
  const allAttributes = [
    ...batAttributes,
    ...protectionAttributes,
    ...wicketKeepingAttributes,
    ...juniorAttributes,
  ]

  for (const attr of allAttributes) {
    await prisma.attribute.upsert({
      where: { slug: attr.slug },
      update: {
        name: attr.name,
        type: attr.type,
        options: attr.options,
        isRequired: attr.isRequired,
        sortOrder: attr.sortOrder,
        categoryId: attr.categoryId,
      },
      create: {
        name: attr.name,
        slug: attr.slug,
        type: attr.type,
        options: attr.options,
        isRequired: attr.isRequired,
        sortOrder: attr.sortOrder,
        categoryId: attr.categoryId,
      },
    })
    console.log(`✅ Created attribute: ${attr.name}`)
  }

  console.log('🏆 Cricket attributes seeding completed!')
}

seedAttributes()
  .catch((e) => {
    console.error('❌ Error seeding attributes:', e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })