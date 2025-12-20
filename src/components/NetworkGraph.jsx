import { useEffect, useRef } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useLanguage } from './LanguageContext';

export default function NetworkGraph({ challenges = [], solutions = [], pilots = [] }) {
  const canvasRef = useRef(null);
  const { language, isRTL, t } = useLanguage();

  useEffect(() => {
    if (!canvasRef.current) return;

    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    const width = canvas.width = canvas.offsetWidth;
    const height = canvas.height = canvas.offsetHeight;

    // Clear canvas
    ctx.clearRect(0, 0, width, height);

    // Create nodes
    const nodes = [];
    const centerX = width / 2;
    const centerY = height / 2;
    const radius = Math.min(width, height) * 0.35;

    // Add challenge nodes (red circle)
    challenges.slice(0, 10).forEach((challenge, i) => {
      const angle = (i / 10) * 2 * Math.PI;
      nodes.push({
        id: challenge.id,
        type: 'challenge',
        x: centerX + radius * Math.cos(angle),
        y: centerY + radius * Math.sin(angle),
        label: challenge.code || `C${i + 1}`,
        color: '#ef4444'
      });
    });

    // Add solution nodes (green circle - inner)
    solutions.slice(0, 8).forEach((solution, i) => {
      const angle = (i / 8) * 2 * Math.PI;
      nodes.push({
        id: solution.id,
        type: 'solution',
        x: centerX + (radius * 0.5) * Math.cos(angle),
        y: centerY + (radius * 0.5) * Math.sin(angle),
        label: solution.name_en?.substring(0, 3) || `S${i + 1}`,
        color: '#22c55e'
      });
    });

    // Add pilot nodes (blue - scattered)
    pilots.slice(0, 6).forEach((pilot, i) => {
      const angle = (i / 6) * 2 * Math.PI + Math.PI / 6;
      nodes.push({
        id: pilot.id,
        type: 'pilot',
        x: centerX + (radius * 0.7) * Math.cos(angle),
        y: centerY + (radius * 0.7) * Math.sin(angle),
        label: pilot.code || `P${i + 1}`,
        color: '#3b82f6'
      });
    });

    // Draw connections
    ctx.strokeStyle = '#cbd5e1';
    ctx.lineWidth = 1;
    pilots.forEach(pilot => {
      const pilotNode = nodes.find(n => n.id === pilot.id);
      const challengeNode = nodes.find(n => n.id === pilot.challenge_id);
      const solutionNode = nodes.find(n => n.id === pilot.solution_id);

      if (pilotNode && challengeNode) {
        ctx.beginPath();
        ctx.moveTo(pilotNode.x, pilotNode.y);
        ctx.lineTo(challengeNode.x, challengeNode.y);
        ctx.stroke();
      }

      if (pilotNode && solutionNode) {
        ctx.beginPath();
        ctx.moveTo(pilotNode.x, pilotNode.y);
        ctx.lineTo(solutionNode.x, solutionNode.y);
        ctx.stroke();
      }
    });

    // Draw nodes
    nodes.forEach(node => {
      ctx.beginPath();
      ctx.arc(node.x, node.y, 15, 0, 2 * Math.PI);
      ctx.fillStyle = node.color;
      ctx.fill();
      ctx.strokeStyle = '#fff';
      ctx.lineWidth = 2;
      ctx.stroke();

      // Draw label
      ctx.fillStyle = '#1e293b';
      ctx.font = '10px sans-serif';
      ctx.textAlign = 'center';
      ctx.fillText(node.label, node.x, node.y + 25);
    });

  }, [challenges, solutions, pilots]);

  return (
    <Card>
      <CardHeader>
        <CardTitle>
          {t({ en: 'Network Visualization', ar: 'تصور الشبكة' })}
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="relative">
          <canvas 
            ref={canvasRef} 
            className="w-full h-96 border rounded-lg bg-gradient-to-br from-slate-50 to-blue-50"
          />
          <div className="flex items-center justify-center gap-6 mt-4 text-sm">
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 rounded-full bg-red-500" />
              <span>{t({ en: 'Challenges', ar: 'التحديات' })}</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 rounded-full bg-green-500" />
              <span>{t({ en: 'Solutions', ar: 'الحلول' })}</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 rounded-full bg-blue-500" />
              <span>{t({ en: 'Pilots', ar: 'التجارب' })}</span>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}