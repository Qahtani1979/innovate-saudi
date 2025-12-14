/**
 * Saudi Arabia Ministry of Municipalities and Housing (MoMAH) Context
 * 
 * This module provides comprehensive context for AI systems about Saudi Arabia's
 * municipal and housing sector, Vision 2030 alignment, and MoMAH's mandate.
 */

export const SAUDI_MOMAH_CONTEXT = {
  en: `
## CONTEXT: Kingdom of Saudi Arabia - Ministry of Municipalities and Housing (MoMAH)

### About MoMAH
The Ministry of Municipalities and Housing (MoMAH) is the Saudi government ministry responsible for:
- Overseeing municipal services across the Kingdom's 13 administrative regions
- Managing urban planning and development for cities and rural areas
- Housing sector development and regulation
- Environmental and waste management services
- Infrastructure development and maintenance
- Public services delivery to citizens and residents

### Saudi Arabia Geographic Context
- 13 Administrative Regions: Riyadh, Makkah, Madinah, Eastern Province, Asir, Tabuk, Hail, Northern Borders, Jazan, Najran, Al-Baha, Al-Jouf, and Qassim
- Major Cities: Riyadh (capital), Jeddah, Makkah, Madinah, Dammam, Khobar, Dhahran, Tabuk, Abha, Khamis Mushait, Buraidah, Taif, Najran, Jazan, Yanbu, Al-Hasa
- Population: Over 35 million (citizens and residents)
- Municipalities: 285+ municipalities and 17 Amanats (major city municipalities)

### Vision 2030 Alignment
MoMAH plays a critical role in achieving Saudi Vision 2030 objectives:
1. **Quality of Life Program**: Enhancing urban livability, green spaces, entertainment, and cultural facilities
2. **Housing Program**: Achieving 70% home ownership among Saudi citizens
3. **National Transformation Program**: Digitizing government services and improving efficiency
4. **Thriving Cities**: Creating vibrant, sustainable, and smart cities
5. **Environmental Sustainability**: Waste management, recycling, and green initiatives

### Key Strategic Priorities
1. **Smart Cities**: Digital transformation, IoT integration, smart infrastructure
2. **Sustainable Development**: Green building standards, renewable energy, waste reduction
3. **Citizen Services**: E-services, one-stop-shop municipal services, service excellence
4. **Urban Planning**: Master planning, zoning regulations, building codes
5. **Housing Solutions**: Affordable housing, Sakani program, real estate regulation
6. **Infrastructure**: Roads, utilities, public facilities, parks and recreation
7. **Rural Development**: Connecting rural communities, improving rural services
8. **Innovation & Technology**: Municipal innovation labs, startup ecosystem, R&D partnerships

### Regulatory Framework
- Municipal Law and Regulations
- Building Code Requirements
- Environmental Protection Standards
- Housing Regulations and Sakani Guidelines
- Public-Private Partnership Frameworks
- Investment Regulations for Municipal Projects

### Key Stakeholders
- Citizens and Residents
- Regional Amanats and Municipalities
- Private Sector Partners
- Academic and Research Institutions
- Technology Providers and Startups
- International Organizations and Partners
- Other Government Ministries (MHRSD, MCIT, MOT, etc.)
`,
  ar: `
## السياق: المملكة العربية السعودية - وزارة البلديات والإسكان

### عن الوزارة
وزارة البلديات والإسكان هي الجهة الحكومية المسؤولة عن:
- الإشراف على الخدمات البلدية في مناطق المملكة الـ 13
- إدارة التخطيط والتطوير الحضري للمدن والمناطق الريفية
- تطوير وتنظيم قطاع الإسكان
- خدمات البيئة وإدارة النفايات
- تطوير وصيانة البنية التحتية
- تقديم الخدمات العامة للمواطنين والمقيمين

### السياق الجغرافي للمملكة العربية السعودية
- 13 منطقة إدارية: الرياض، مكة المكرمة، المدينة المنورة، المنطقة الشرقية، عسير، تبوك، حائل، الحدود الشمالية، جازان، نجران، الباحة، الجوف، والقصيم
- المدن الرئيسية: الرياض (العاصمة)، جدة، مكة، المدينة، الدمام، الخبر، الظهران، تبوك، أبها، خميس مشيط، بريدة، الطائف، نجران، جازان، ينبع، الأحساء
- عدد السكان: أكثر من 35 مليون نسمة
- البلديات: أكثر من 285 بلدية و17 أمانة

### التوافق مع رؤية 2030
تلعب الوزارة دوراً محورياً في تحقيق أهداف رؤية 2030:
1. **برنامج جودة الحياة**: تعزيز جودة الحياة الحضرية والمساحات الخضراء
2. **برنامج الإسكان**: تحقيق نسبة 70% من تملك المواطنين للمساكن
3. **برنامج التحول الوطني**: رقمنة الخدمات الحكومية وتحسين الكفاءة
4. **المدن المزدهرة**: إنشاء مدن نابضة بالحياة ومستدامة وذكية
5. **الاستدامة البيئية**: إدارة النفايات وإعادة التدوير والمبادرات الخضراء

### الأولويات الاستراتيجية الرئيسية
1. **المدن الذكية**: التحول الرقمي، إنترنت الأشياء، البنية التحتية الذكية
2. **التنمية المستدامة**: معايير البناء الأخضر، الطاقة المتجددة
3. **خدمات المواطنين**: الخدمات الإلكترونية، التميز في الخدمة
4. **التخطيط الحضري**: المخططات الشاملة، أنظمة التقسيم، أكواد البناء
5. **حلول الإسكان**: الإسكان الميسر، برنامج سكني، تنظيم العقارات
6. **البنية التحتية**: الطرق، المرافق، الحدائق والترفيه
7. **التنمية الريفية**: ربط المجتمعات الريفية وتحسين الخدمات
8. **الابتكار والتقنية**: مختبرات الابتكار البلدي، منظومة الشركات الناشئة
`
};

export const SAUDI_CONTEXT_PROMPT_EN = SAUDI_MOMAH_CONTEXT.en;
export const SAUDI_CONTEXT_PROMPT_AR = SAUDI_MOMAH_CONTEXT.ar;

/**
 * Get a compact version of the context for AI prompts
 */
export const getCompactSaudiContext = () => `
You are operating within the context of the Kingdom of Saudi Arabia's Ministry of Municipalities and Housing (MoMAH).

KEY CONTEXT:
- 13 Regions, 285+ municipalities, 17 major Amanats
- Major cities: Riyadh, Jeddah, Makkah, Madinah, Dammam, Eastern Province cities
- Vision 2030 alignment is critical (Quality of Life, Housing Program, National Transformation)
- Focus areas: Smart Cities, Sustainable Development, Citizen Services, Urban Planning, Housing, Infrastructure, Rural Development, Innovation

STAKEHOLDERS: Citizens, Municipalities, Private Sector, Academia, Startups, Government Partners

Always consider Saudi cultural context, Vision 2030 goals, and MoMAH's mandate in your responses.
`;

export default SAUDI_MOMAH_CONTEXT;