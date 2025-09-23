export interface RandomNumberParams {
    min: number;
    max: number;
}

export interface RandomNumberResult {
    random: number;
    min: number;
    max: number;
    timestamp: string;
}

export class RandomService {
    // gera um número aleatório usando a API Random.org
    public static async generateRandomNumber(
        params: RandomNumberParams,
        requestFunction: (options: any) => Promise<string>
    ): Promise<RandomNumberResult> {
        const { min, max } = params;
        
        // valida os parâmetros de entrada
        if (!Number.isInteger(min) || !Number.isInteger(max)) {
            throw new Error('Os valores Mínimo e Máximo devem ser números inteiros');
        }

        if (min >= max) {
            throw new Error(`O valor Mínimo (${min}) deve ser menor que o valor Máximo (${max})`);
        }

        if (min < -1000000000 || max > 1000000000) {
            throw new Error('Os valores devem estar entre -1.000.000.000 e 1.000.000.000 para a API Random.org');
        }

        // constrói a URL da API com os valores min e max
        const url = `https://www.random.org/integers/?num=1&min=${min}&max=${max}&col=1&base=10&format=plain&rnd=new`;
        
        try {
            // faz a requisição HTTP
            const responseData = await requestFunction({
                method: 'GET',
                url: url,
                timeout: 10000,
            });

            // processa a resposta da API - converte para string se necessário
            const responseString = typeof responseData === 'string' 
                ? responseData 
                : String(responseData);
            
            const trimmedResponse = responseString.trim();
            if (!trimmedResponse) {
                throw new Error('Resposta inválida da API Random.org');
            }

            const randomNumber = parseInt(trimmedResponse, 10);
            if (isNaN(randomNumber) || randomNumber < min || randomNumber > max) {
                throw new Error(`Número inválido recebido: ${trimmedResponse}`);
            }

            return {
                random: randomNumber,
                min,
                max,
                timestamp: new Date().toISOString().replace('T', ' ').replace(/\.\d{3}Z$/, ' UTC'),
            };
            
        } catch (error: any) {
            // trata erros específicos
            if (error.code === 'ETIMEDOUT') {
                throw new Error('Timeout na requisição para a API Random.org. Tente novamente.');
            }
            throw new Error(`Falha ao gerar número aleatório: ${error.message}`);
        }
    }
}