-- Populate missing role-permission mappings for key personas

-- CITIZEN role permissions
INSERT INTO role_permissions (role_id, permission_id) VALUES
  ('fa3d30af-9f44-45d9-9e1c-884025af2f8f', 'adfff9c3-52dc-4279-a58e-9cc11e33eeea'), -- citizen_idea_submit
  ('fa3d30af-9f44-45d9-9e1c-884025af2f8f', '4511191f-307c-4f95-a02f-fbc21017f78b'), -- citizen_idea_view
  ('fa3d30af-9f44-45d9-9e1c-884025af2f8f', '368e366f-3088-4be5-9982-5f8461402126'), -- citizen_idea_vote
  ('fa3d30af-9f44-45d9-9e1c-884025af2f8f', '25d13e4a-e96c-41e8-b4e0-8c7aa8ea9054'), -- citizen_idea_comment
  ('fa3d30af-9f44-45d9-9e1c-884025af2f8f', 'bd99a85e-ca2d-459f-a129-6b603cb16da3')  -- citizen_dashboard_view
ON CONFLICT DO NOTHING;

-- PROVIDER role permissions  
INSERT INTO role_permissions (role_id, permission_id) VALUES
  ('13c30bfb-424f-44cb-927e-92cd8ca26206', '2749895e-3136-4c15-ae3f-c1c6c27ff76c'), -- solution_create
  ('13c30bfb-424f-44cb-927e-92cd8ca26206', '3f28299b-8956-4b42-a5e8-da3f07e19e9f'), -- solution_edit_own
  ('13c30bfb-424f-44cb-927e-92cd8ca26206', 'cd192712-87a2-4048-b367-da8b439887cd'), -- solution_view_own
  ('13c30bfb-424f-44cb-927e-92cd8ca26206', 'c8219352-3238-4d9d-abc6-713529c06ff9'), -- solution_submit
  ('13c30bfb-424f-44cb-927e-92cd8ca26206', 'b0f45bc8-fb23-4ed2-b479-ea01d0430660'), -- provider_dashboard
  ('13c30bfb-424f-44cb-927e-92cd8ca26206', '435ab134-a4d2-4dee-a9f5-1dc1887ecbf4')  -- solution_view
ON CONFLICT DO NOTHING;

-- EXPERT role permissions
INSERT INTO role_permissions (role_id, permission_id) VALUES
  ('023eaaf4-cbf6-4319-a3c7-f915ced4e5f9', 'c4042659-72ce-49d8-861e-9c6426f64a1a'), -- expert_evaluate
  ('023eaaf4-cbf6-4319-a3c7-f915ced4e5f9', '016e88dd-2601-48ee-8121-4d91fd3c6bca')  -- expert_view_assignments
ON CONFLICT DO NOTHING;

-- RESEARCHER role permissions
INSERT INTO role_permissions (role_id, permission_id) VALUES
  ('65e786ab-84e0-4a13-8586-c9de0518c3e8', 'd2a40c88-a26f-480a-994e-9643c6a46fbe'), -- rd_project_create
  ('65e786ab-84e0-4a13-8586-c9de0518c3e8', '8ac790ca-e19e-4a9b-8386-eb9ec7cc4b5a')  -- rd_proposal_view_all
ON CONFLICT DO NOTHING;

-- USER role (basic permissions - can view public ideas)
INSERT INTO role_permissions (role_id, permission_id) VALUES
  ('a0a0c20c-c19c-4e05-810a-29a848172bfc', '4511191f-307c-4f95-a02f-fbc21017f78b')  -- citizen_idea_view
ON CONFLICT DO NOTHING;

-- VIEWER role intentionally has no specific permissions (read-only by design)