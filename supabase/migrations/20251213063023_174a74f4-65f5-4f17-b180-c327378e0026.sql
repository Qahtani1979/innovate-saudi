-- Add all missing trigger configurations for templates
INSERT INTO email_trigger_config (trigger_key, template_key, is_active, recipient_field, variable_mapping, respect_preferences, priority, delay_seconds) VALUES
-- Auth triggers
('auth.email_verification', 'email_verification', true, 'email', '{"userName": "full_name", "verificationLink": "verification_url"}', false, 1, 0),
('auth.password_changed', 'password_changed', true, 'email', '{"userName": "full_name"}', false, 1, 0),
('auth.login_new_device', 'login_new_device', true, 'email', '{"userName": "full_name", "deviceInfo": "device_info", "loginTime": "login_time"}', false, 1, 0),
('auth.account_locked', 'account_locked', true, 'email', '{"userName": "full_name"}', false, 1, 0),
('auth.account_deactivated', 'account_deactivated', true, 'email', '{"userName": "full_name"}', false, 1, 0),
('auth.account_suspended', 'account_suspended_admin', true, 'email', '{"userName": "full_name", "reason": "suspension_reason"}', false, 1, 0),
('auth.registration_pending', 'user_registration_pending', true, 'email', '{"userName": "full_name"}', true, 3, 0),
('auth.inactive_reengagement', 'inactive_user_reengagement', true, 'email', '{"userName": "full_name"}', true, 5, 0),

-- Challenge triggers
('challenge.assigned', 'challenge_assigned', true, 'review_assigned_to', '{"challengeTitle": "title_en", "assignerName": "assigned_by_name"}', true, 3, 0),
('challenge.escalated', 'challenge_escalated', true, 'challenge_owner_email', '{"challengeTitle": "title_en", "escalationLevel": "escalation_level"}', true, 2, 0),
('challenge.match_found', 'challenge_match_found', true, 'challenge_owner_email', '{"challengeTitle": "title_en", "solutionTitle": "solution_title"}', true, 3, 0),
('challenge.status_changed', 'challenge_status_change', true, 'challenge_owner_email', '{"challengeTitle": "title_en", "oldStatus": "old_status", "newStatus": "status"}', true, 3, 0),
('challenge.needs_info', 'challenge_needs_info', true, 'challenge_owner_email', '{"challengeTitle": "title_en", "requiredInfo": "required_info"}', true, 2, 0),

-- Citizen triggers
('citizen.signup', 'citizen_welcome', true, 'email', '{"userName": "full_name"}', false, 1, 0),
('citizen.badge_earned', 'badge_earned', true, 'email', '{"userName": "full_name", "badgeName": "badge_name"}', true, 4, 0),
('citizen.level_up', 'level_up', true, 'email', '{"userName": "full_name", "newLevel": "level"}', true, 4, 0),
('citizen.points_expiring', 'points_expiring', true, 'email', '{"userName": "full_name", "pointsExpiring": "expiring_points", "expiryDate": "expiry_date"}', true, 3, 0),
('idea.approved', 'idea_approved', true, 'user_email', '{"ideaTitle": "title", "userName": "user_name"}', true, 3, 0),
('idea.converted', 'idea_converted', true, 'user_email', '{"ideaTitle": "title", "challengeTitle": "challenge_title"}', true, 3, 0),
('vote.confirmation', 'vote_confirmation', true, 'user_email', '{"entityTitle": "entity_title", "voteType": "vote_type"}', true, 5, 0),

-- Pilot triggers
('pilot.enrollment_confirmed', 'pilot_enrollment_confirmed', true, 'user_email', '{"pilotName": "pilot_name", "userName": "user_name"}', true, 3, 0),
('pilot.feedback_request', 'pilot_feedback_request', true, 'user_email', '{"pilotName": "pilot_name", "userName": "user_name"}', true, 4, 60),
('pilot.milestone_reached', 'pilot_milestone_reached', true, 'pilot_lead_email', '{"pilotName": "name_en", "milestoneName": "milestone_name"}', true, 3, 0),
('pilot.completed', 'pilot_completed', true, 'pilot_lead_email', '{"pilotName": "name_en"}', true, 2, 0),
('pilot.extended', 'pilot_extended', true, 'pilot_lead_email', '{"pilotName": "name_en", "newEndDate": "end_date"}', true, 3, 0),

-- Contract triggers
('contract.created', 'contract_created', true, 'signed_by_municipality', '{"contractTitle": "title_en", "contractCode": "contract_code"}', true, 2, 0),
('contract.signed', 'contract_signed', true, 'signed_by_provider', '{"contractTitle": "title_en", "signedBy": "signed_by_municipality"}', true, 2, 0),
('contract.pending_signature', 'contract_pending_signature', true, 'signed_by_provider', '{"contractTitle": "title_en"}', true, 2, 0),

-- Evaluation triggers
('evaluation.completed', 'evaluation_completed', true, 'requester_email', '{"evaluationType": "evaluation_type", "entityTitle": "entity_title"}', true, 3, 0),
('evaluation.reminder', 'evaluation_reminder', true, 'evaluator_email', '{"evaluationType": "evaluation_type", "dueDate": "due_date"}', true, 3, 0),
('feedback.requested', 'feedback_requested', true, 'recipient_email', '{"entityTitle": "entity_title", "feedbackType": "feedback_type"}', true, 3, 0),
('feedback.received', 'feedback_received', true, 'requester_email', '{"entityTitle": "entity_title", "feedbackFrom": "feedback_from"}', true, 4, 0),
('panel.invitation', 'panel_invitation', true, 'expert_email', '{"panelName": "panel_name", "sessionDate": "session_date"}', true, 2, 0),
('panel.reminder', 'panel_reminder', true, 'expert_email', '{"panelName": "panel_name", "sessionDate": "session_date"}', true, 2, 0),

-- Event triggers
('event.invitation', 'event_invitation', true, 'recipient_email', '{"eventTitle": "title_en", "eventDate": "event_date"}', true, 3, 0),
('event.registration_confirmed', 'event_registration_confirmed', true, 'user_email', '{"eventTitle": "title_en", "eventDate": "event_date"}', true, 3, 0),
('event.updated', 'event_updated', true, 'attendee_email', '{"eventTitle": "title_en", "changes": "change_summary"}', true, 3, 0),
('event.cancelled', 'event_cancelled', true, 'attendee_email', '{"eventTitle": "title_en"}', true, 2, 0),

-- Booking triggers
('demo.scheduled', 'demo_scheduled', true, 'requester_email', '{"solutionName": "solution_name", "demoDate": "scheduled_date"}', true, 2, 0),
('demo.request_received', 'demo_request_received', true, 'requester_email', '{"solutionName": "solution_name"}', true, 3, 0),
('living_lab.booking_confirmed', 'living_lab_booking_confirmed', true, 'user_email', '{"labName": "lab_name", "bookingDate": "booking_date"}', true, 2, 0),
('living_lab.booking_reminder', 'living_lab_booking_reminder', true, 'user_email', '{"labName": "lab_name", "bookingDate": "booking_date"}', true, 2, 86400),

-- Program triggers
('program.application_received', 'program_application_received', true, 'applicant_email', '{"programName": "program_name", "applicationId": "application_id"}', true, 3, 0),
('program.application_status', 'program_application_status', true, 'applicant_email', '{"programName": "program_name", "status": "application_status"}', true, 2, 0),
('program.deadline_reminder', 'program_deadline_reminder', true, 'user_email', '{"programName": "program_name", "deadline": "application_deadline"}', true, 3, 86400),

-- Proposal triggers
('proposal.submitted', 'proposal_submitted', true, 'challenge_owner_email', '{"proposalTitle": "title", "providerName": "provider_name", "challengeTitle": "challenge_title"}', true, 3, 0),
('proposal.accepted', 'proposal_accepted', true, 'provider_email', '{"proposalTitle": "title", "challengeTitle": "challenge_title"}', true, 2, 0),
('proposal.rejected', 'proposal_rejected', true, 'provider_email', '{"proposalTitle": "title", "challengeTitle": "challenge_title", "feedback": "feedback"}', true, 3, 0),
('proposal.revision_requested', 'proposal_revision_requested', true, 'provider_email', '{"proposalTitle": "title", "feedback": "revision_notes"}', true, 2, 0),

-- Solution triggers
('solution.submitted', 'solution_submitted', true, 'provider_email', '{"solutionName": "name_en"}', true, 3, 0),
('solution.published', 'solution_published', true, 'provider_email', '{"solutionName": "name_en"}', true, 3, 0),
('solution.interest_received', 'solution_interest_received', true, 'provider_email', '{"solutionName": "name_en", "interestedParty": "interested_by"}', true, 3, 0),

-- Task triggers
('task.due_reminder', 'task_reminder', true, 'assigned_to_email', '{"taskTitle": "title", "dueDate": "due_date"}', true, 3, 86400),
('task.overdue', 'task_overdue', true, 'assigned_to_email', '{"taskTitle": "title", "daysOverdue": "days_overdue"}', true, 2, 0),
('task.completed', 'task_completed', true, 'assigned_by_email', '{"taskTitle": "title", "completedBy": "completed_by_name"}', true, 4, 0),

-- Finance triggers
('invoice.issued', 'invoice_issued', true, 'recipient_email', '{"invoiceNumber": "invoice_number", "amount": "total_amount"}', true, 2, 0),
('payment.received', 'payment_received', true, 'payer_email', '{"invoiceNumber": "invoice_number", "amount": "amount_paid"}', true, 3, 0),
('payment.overdue', 'payment_overdue', true, 'payer_email', '{"invoiceNumber": "invoice_number", "daysOverdue": "days_overdue"}', true, 2, 0),

-- Report triggers
('report.generated', 'report_generated', true, 'requester_email', '{"reportName": "report_name", "downloadLink": "download_url"}', true, 3, 0),
('report.scheduled', 'report_scheduled', true, 'recipient_email', '{"reportName": "report_name", "frequency": "schedule_frequency"}', true, 4, 0)

ON CONFLICT (trigger_key) DO UPDATE SET
  template_key = EXCLUDED.template_key,
  is_active = EXCLUDED.is_active,
  recipient_field = EXCLUDED.recipient_field,
  variable_mapping = EXCLUDED.variable_mapping,
  respect_preferences = EXCLUDED.respect_preferences,
  priority = EXCLUDED.priority,
  delay_seconds = EXCLUDED.delay_seconds,
  updated_at = now();