<?php

namespace App\Command;

use Symfony\Component\Console\Attribute\AsCommand;
use Symfony\Component\Console\Command\Command;
use Symfony\Component\Console\Input\InputInterface;
use Symfony\Component\Console\Output\OutputInterface;
use Symfony\Component\Console\Style\SymfonyStyle;
use Symfony\Contracts\HttpClient\HttpClientInterface;

#[AsCommand(
    name: 'app:test-login',
    description: 'Teste la connexion et obtient un token JWT',
)]
class TestLoginCommand extends Command
{
    public function __construct(
        private HttpClientInterface $httpClient
    ) {
        parent::__construct();
    }

    protected function execute(InputInterface $input, OutputInterface $output): int
    {
        $io = new SymfonyStyle($input, $output);

        try {
            $response = $this->httpClient->request('POST', 'http://127.0.0.1:8001/api/login_check', [
                'json' => [
                    'username' => 'admin',
                    'password' => 'password123'
                ]
            ]);

            $statusCode = $response->getStatusCode();
            $content = $response->getContent(false);
            $headers = $response->getHeaders();

            $io->section('Response Details');
            $io->writeln('Status Code: ' . $statusCode);
            $io->writeln('Content: ' . $content);
            $io->writeln('Headers: ' . json_encode($headers, JSON_PRETTY_PRINT));

            if ($statusCode === 200) {
                $data = json_decode($content, true);
                $io->success('Connexion réussie !');
                $io->writeln('Token JWT : ' . ($data['token'] ?? 'No token found'));
            }

            return Command::SUCCESS;
        } catch (\Exception $e) {
            $io->error([
                'Erreur : ' . $e->getMessage(),
                'Trace : ' . $e->getTraceAsString()
            ]);
            return Command::FAILURE;
        }
    }
} 