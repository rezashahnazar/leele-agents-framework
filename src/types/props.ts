import type { Message, ThemeMode } from './index';

export interface LogsPanelProps {
  logs: Message[];
  setLogs: React.Dispatch<React.SetStateAction<Message[]>>;
  className?: string;
}

export interface HeaderProps {
  theme: ThemeMode;
  onThemeToggle: () => void;
  className?: string;
}

export interface MessageBoxProps {
  message: Message;
  index: number;
  totalMessages: number;
  isExpanded: boolean;
  onExpand: () => void;
  className?: string;
}
