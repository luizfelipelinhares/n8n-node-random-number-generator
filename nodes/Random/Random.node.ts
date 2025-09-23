import {
    IExecuteFunctions,
    INodeExecutionData,
    INodeType,
    INodeTypeDescription,
    NodeOperationError,
} from 'n8n-workflow';

import { RandomService, RandomNumberParams } from './RandomService';

//nó n8n para gerar números aleatórios usando a API Random.org
export class Random implements INodeType {
    // descrição do nó
    description: INodeTypeDescription = {
        displayName: 'Random',
        name: 'random',
        icon: 'file:random.svg',
        group: ['transform'],
        version: 1,
        description: 'True Random Number Generator',
        defaults: {
            name: 'True Random Number Generator',
        },
        inputs: ['main'],
        outputs: ['main'],
        properties: [
            {
                displayName: 'Min',
                name: 'min',
                type: 'number',
                default: 1,
                required: true,
                description: 'Valor mínimo',
                typeOptions: {
                    minValue: -1000000000,
                    maxValue: 1000000000,
                    numberPrecision: 0,
                },
            },
            {
                displayName: 'Max',
                name: 'max',
                type: 'number',
                default: 100,
                required: true,
                description: 'Valor máximo',
                typeOptions: {
                    minValue: -1000000000,
                    maxValue: 1000000000,
                    numberPrecision: 0
                },
            },
        ],
    };

    // executa o nó para cada item de entrada
    async execute(this: IExecuteFunctions): Promise<INodeExecutionData[][]> {
        const items = this.getInputData();
        const returnData: INodeExecutionData[] = [];

        for (let i = 0; i < items.length; i++) {
            try {
                // extrai os parâmetros do nó
                const params: RandomNumberParams = {
                    min: this.getNodeParameter('min', i) as number,
                    max: this.getNodeParameter('max', i) as number,
                };

                // chama o service para gerar o número aleatório
                const result = await RandomService.generateRandomNumber(
                    params,
                    (options) => this.helpers.httpRequest(options)
                );

                returnData.push({
                    json: {
                        random: result.random,
                        min: result.min,
                        max: result.max,
                        timestamp: result.timestamp,
                    },
                });
            } catch (error) {
                // converte erro do serviço para erro do n8n
                const nodeError = new NodeOperationError(
                    this.getNode(),
                    error.message,
                    { itemIndex: i }
                );

                if (this.continueOnFail()) {
                    returnData.push({
                        json: {
                            error: error.message,
                        },
                        error: nodeError,
                    });
                    continue;
                }
                throw nodeError;
            }
        }
        return [returnData];
    }
}