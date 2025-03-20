import { Scale } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { useCompareStore } from '@/lib/store';

interface CompareButtonProps {
  agentId: string;
}

export function CompareButton({ agentId }: CompareButtonProps) {
  const { agents, addAgent, removeAgent } = useCompareStore();
  const isSelected = agents.includes(agentId);

  function handleClick() {
    if (isSelected) {
      removeAgent(agentId);
    } else {
      addAgent(agentId);
    }
  }

  return (
    <Button
      variant={isSelected ? 'primary' : 'secondary'}
      size="sm"
      onClick={handleClick}
      disabled={!isSelected && agents.length >= 3}
      title={
        !isSelected && agents.length >= 3
          ? 'Máximo de 3 agentes para comparação'
          : ''
      }
    >
      <Scale className="h-4 w-4 mr-2" />
      {isSelected ? 'Remover da Comparação' : 'Adicionar à Comparação'}
    </Button>
  );
}