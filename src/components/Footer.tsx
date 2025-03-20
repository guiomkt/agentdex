import { Link } from 'react-router-dom';
import { Bot, Github, Twitter, Linkedin } from 'lucide-react';

export function Footer() {
  return (
    <footer className="bg-secondary text-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          <div>
            <Link to="/" className="flex items-center">
              <Bot className="h-8 w-8 text-primary" />
              <span className="ml-2 text-xl font-bold">AgentDex</span>
            </Link>
            <p className="mt-4 text-white">
              O maior diretório de agentes de IA do Brasil
            </p>
          </div>

          <div>
            <h3 className="text-lg font-semibold mb-4">Navegação</h3>
            <ul className="space-y-2">
              <li>
                <Link to="/marketplace" className="hover:text-primary">
                  Marketplace
                </Link>
              </li>
              <li>
                <Link to="/agencies" className="hover:text-primary">
                  Agências
                </Link>
              </li>
              <li>
                <Link to="/ranking" className="hover:text-primary">
                  Ranking
                </Link>
              </li>
              <li>
                <Link to="/submit" className="hover:text-primary">
                  Submeter Agente
                </Link>
              </li>
            </ul>
          </div>

          <div>
            <h3 className="text-lg font-semibold mb-4">Redes Sociais</h3>
            <div className="flex space-x-4">
              <a href="#" className="hover:text-primary">
                <Twitter className="h-6 w-6" />
              </a>
              <a href="#" className="hover:text-primary">
                <Linkedin className="h-6 w-6" />
              </a>
              <a href="#" className="hover:text-primary">
                <Github className="h-6 w-6" />
              </a>
            </div>
          </div>
        </div>

        <div className="mt-12 pt-8 border-t border-secondary-light text-center">
          <p>© 2024 AgentDex. Todos os direitos reservados.</p>
        </div>
      </div>
    </footer>
  );
}