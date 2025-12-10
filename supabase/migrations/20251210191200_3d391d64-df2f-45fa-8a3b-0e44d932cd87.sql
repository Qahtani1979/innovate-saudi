-- Add remaining Saudi universities and colleges with verified domains
INSERT INTO organizations (name_en, name_ar, type, website, is_verified, is_active) VALUES
-- Private Colleges - Riyadh
('College of Telecom & Information', 'كلية الاتصالات والمعلومات', 'university', 'https://cti.edu.sa', true, true),
('Riyadh College of Dentistry and Pharmacy', 'كلية الرياض لطب الأسنان والصيدلة', 'university', 'https://riyadh.edu.sa', true, true),
('Al Farabi College of Dentistry and Nursing', 'كلية الفارابي لطب الأسنان والتمريض', 'university', 'https://alfarabi.edu.sa', true, true),
('Technical Trainers College', 'كلية المدربين التقنيين', 'university', 'https://ttcollege.edu.sa', true, true),
('Arab East Colleges', 'كليات الشرق العربي', 'university', 'https://arabeast.edu.sa', true, true),

-- Private Colleges - Jeddah
('Jeddah College of Technology', 'كلية جدة التقنية', 'university', 'https://jct.edu.sa', true, true),
('Batterjee Medical College', 'كلية البترجي الطبية', 'university', 'https://bmc.edu.sa', true, true),
('Prince Sultan College For Tourism and Business', 'كلية الأمير سلطان للسياحة والأعمال', 'university', 'https://pscj.edu.sa', true, true),
('Ibn Sina National College for Medical Studies', 'كلية ابن سينا الوطنية للعلوم الطبية', 'university', 'https://ibnsina.edu.sa', true, true),
('Prince Mohammad bin Salman College', 'كلية الأمير محمد بن سلمان', 'university', 'https://mbsc.edu.sa', true, true),
('College of Telecom & Electronics', 'كلية الاتصالات والإلكترونيات', 'university', 'https://cte.edu.sa', true, true),
('Fakeeh College for Medical Sciences', 'كلية فقيه للعلوم الطبية', 'university', 'https://fcms.edu.sa', true, true),

-- Medina Region
('Al-Madinah College of Technology', 'كلية المدينة التقنية', 'university', 'https://mct.edu.sa', true, true),
('Yanbu University College', 'كلية ينبع الجامعية', 'university', 'https://yuc.edu.sa', true, true),

-- Eastern Province
('Mohammed Almana College of Medical Sciences', 'كلية محمد المانع للعلوم الطبية', 'university', 'https://machs.edu.sa', true, true),
('Jubail Technical Institute', 'المعهد التقني بالجبيل', 'university', 'https://jti.edu.sa', true, true),
('University College of Jubail', 'الكلية الجامعية بالجبيل', 'university', 'https://ucj.edu.sa', true, true),

-- Asir Region
('IBN Rushd College for Management Sciences', 'كلية ابن رشد للعلوم الإدارية', 'university', 'https://ibnrushd.edu.sa', true, true),

-- Qassim Region
('Sulaiman Al Rajhi University', 'جامعة سليمان الراجحي', 'university', 'https://sr.edu.sa', true, true);

-- Add auto-approval rules for new institutions
INSERT INTO auto_approval_rules (persona_type, rule_type, rule_value, role_to_assign, is_active, priority) VALUES
('researcher', 'email_domain', 'cti.edu.sa', 'researcher', true, 10),
('researcher', 'email_domain', 'riyadh.edu.sa', 'researcher', true, 10),
('researcher', 'email_domain', 'alfarabi.edu.sa', 'researcher', true, 10),
('researcher', 'email_domain', 'ttcollege.edu.sa', 'researcher', true, 10),
('researcher', 'email_domain', 'arabeast.edu.sa', 'researcher', true, 10),
('researcher', 'email_domain', 'jct.edu.sa', 'researcher', true, 10),
('researcher', 'email_domain', 'bmc.edu.sa', 'researcher', true, 10),
('researcher', 'email_domain', 'pscj.edu.sa', 'researcher', true, 10),
('researcher', 'email_domain', 'ibnsina.edu.sa', 'researcher', true, 10),
('researcher', 'email_domain', 'mbsc.edu.sa', 'researcher', true, 10),
('researcher', 'email_domain', 'cte.edu.sa', 'researcher', true, 10),
('researcher', 'email_domain', 'fcms.edu.sa', 'researcher', true, 10),
('researcher', 'email_domain', 'mct.edu.sa', 'researcher', true, 10),
('researcher', 'email_domain', 'yuc.edu.sa', 'researcher', true, 10),
('researcher', 'email_domain', 'machs.edu.sa', 'researcher', true, 10),
('researcher', 'email_domain', 'jti.edu.sa', 'researcher', true, 10),
('researcher', 'email_domain', 'ucj.edu.sa', 'researcher', true, 10),
('researcher', 'email_domain', 'ibnrushd.edu.sa', 'researcher', true, 10),
('researcher', 'email_domain', 'sr.edu.sa', 'researcher', true, 10);