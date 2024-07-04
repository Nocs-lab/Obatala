import { useState, useEffect } from 'react';
import { Spinner, Notice } from '@wordpress/components';
import apiFetch from '@wordpress/api-fetch';

const ProcessViewer = () => {
    // Estados para armazenar o processo, estado de carregamento e erros
    const [process, setProcess] = useState(null); // Armazena os dados do processo
    const [isLoading, setIsLoading] = useState(true); // Estado para indicar se está carregando
    const [error, setError] = useState(null); // Armazena mensagens de erro

    // Função para obter o ID do processo da URL atual
    const getProcessIdFromUrl = () => {
        const urlParams = new URLSearchParams(window.location.search);
        return urlParams.get('process_id');
    };

    // Efeito para carregar o processo ao montar o componente
    useEffect(() => {
        const processId = getProcessIdFromUrl();
        if (processId) {
            fetchProcess(processId); // Se houver ID de processo na URL, busca o processo
        } else {
            setError('No process ID found in the URL.'); // Se não houver ID, define erro
            setIsLoading(false); // Finaliza o estado de carregamento
        }
    }, []);

    // Função para buscar os detalhes do processo na API
    const fetchProcess = (processId) => {
        setIsLoading(true); // Indica que está carregando
        apiFetch({ path: `/wp/v2/process_obatala/${processId}?_embed` })
            .then(data => {
                setProcess(data); // Define os dados do processo no estado
                setIsLoading(false); // Finaliza o estado de carregamento
            })
            .catch(error => {
                console.error('Error fetching process:', error); // Registra erro no console
                setError('Error fetching process details.'); // Define mensagem de erro
                setIsLoading(false); // Finaliza o estado de carregamento
            });
    };

    // Renderização condicional com base nos estados de carregamento e erro
    if (isLoading) {
        return <Spinner />; // Exibe spinner enquanto está carregando
    }

    if (error) {
        return <Notice status="error" isDismissible={false}>{error}</Notice>; // Exibe mensagem de erro se houver
    }

    if (!process) {
        return <Notice status="warning" isDismissible={false}>No process found.</Notice>; // Exibe aviso se não houver processo
    }

    // Renderiza os detalhes do processo
    return (
        <div>
            <span className="brand"><strong>Obatala</strong> Curatorial Process Viewer</span>
            <h2>{process.title.rendered}</h2>
            <div className="process-details">
                <p><strong>Process Type:</strong> {process.process_type}</p>
                <p><strong>Status:</strong> {process.status}</p>
                <p><strong>Current Stage:</strong> {process.current_stage}</p>
                {/* Detalhes adicionais do processo podem ser adicionados aqui */}
            </div>
        </div>
    );
};

export default ProcessViewer;
