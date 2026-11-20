import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();
const categories = [
  ['Electronics & Technology','electronics-technology'],['Fashion & Apparel','fashion-apparel'],['Home & Living','home-living'],['Food & Groceries','food-groceries'],['Beauty & Personal Care','beauty-personal-care'],['Tools & Hardware','tools-hardware'],['Automotive','automotive'],['Books & Stationery','books-stationery'],['Sports & Outdoors','sports-outdoors'],['Kids & Baby','kids-baby'],['Photography & Media','photography-media'],['Office & Business','office-business']
];
async function main(){
  for (const [name,slug] of categories) await prisma.category.upsert({where:{slug},update:{name,isActive:true},create:{name,slug}});
  console.log(`Seeded ${categories.length} marketplace categories. Add products through the admin API.`);
}
main().catch(e=>{console.error(e);process.exit(1)}).finally(()=>prisma.$disconnect());
