const express = require('express')
const multer = require('multer')
const csv = require('csv-parser')
const { Readable } = require('stream')
const { v4: uuidv4 } = require('uuid')

const app = express()
const port = 1030 // A porta em que nosso servidor Node irá rodar

// Configura o multer para processar os uploads em memória
const storage = multer.memoryStorage()
const upload = multer({ storage: storage })

// Cache em memória para armazenar os resultados da análise para download
const analysisCache = new Map()

// Função para processar um buffer de CSV
const processCsvBuffer = buffer => {
  const transactions = new Map()
  return new Promise((resolve, reject) => {
    Readable.from(buffer)
      .pipe(
        csv({
          mapHeaders: ({ header }) => {
            if (header.match(/id/i)) return 'id'
            if (header.match(/revenue/i)) return 'revenue'
            if (header.match(/date/i)) return 'date' // Mapeia a coluna de data
            return null // Ignora outras colunas
          },
        })
      )
      .on('data', row => {
        // Valida se a linha tem os dados necessários
        if (row.id && row.revenue && row.date) {
          transactions.set(row.id, {
            revenue: parseFloat(row.revenue) || 0,
            date: row.date,
          })
        }
      })
      .on('end', () => resolve(transactions))
      .on('error', reject)
  })
}

// Rota para servir a página HTML principal
app.get('/', (req, res) => {
  res.sendFile(__dirname + '/index.html')
})

// Rota para a análise, que aceita os dois arquivos
app.post('/analyze', upload.fields([{ name: 'ga4File' }, { name: 'floodlightFile' }]), async (req, res) => {
  if (!req.files || !req.files.ga4File || !req.files.floodlightFile) {
    return res.status(400).json({ error: 'Por favor, envie ambos os arquivos CSV.' })
  }

  try {
    const ga4Buffer = req.files.ga4File[0].buffer
    const floodlightBuffer = req.files.floodlightFile[0].buffer

    const [ga4Transactions, floodTransactions] = await Promise.all([
      processCsvBuffer(ga4Buffer),
      processCsvBuffer(floodlightBuffer),
    ])

    const onlyGa4Transactions = new Map()
    const onlyFloodTransactions = new Map()
    const bothTransactions = new Map()

    // Compara as transações
    for (const [id, data] of ga4Transactions.entries()) {
      if (floodTransactions.has(id)) {
        bothTransactions.set(id, data)
        floodTransactions.delete(id) // Remove para que depois sobrem apenas os exclusivos
      } else {
        onlyGa4Transactions.set(id, data)
      }
    }

    // O que sobrou em floodTransactions é exclusivo dele
    for (const [id, data] of floodTransactions.entries()) {
      onlyFloodTransactions.set(id, data)
    }

    // Prepara dados para download
    const analysisId = uuidv4()
    analysisCache.set(analysisId, {
      onlyGa4: Array.from(onlyGa4Transactions.keys()),
      onlyFloodlight: Array.from(onlyFloodTransactions.keys()),
      both: Array.from(bothTransactions.keys()),
    })

    // Limpa o cache após 1 hora para evitar consumo excessivo de memória
    setTimeout(() => analysisCache.delete(analysisId), 3600000)

    // Agrupa resultados por data
    const dailyData = {}
    const processDaily = (map, ga4Key, floodKey) => {
      for (const [, { date, revenue }] of map.entries()) {
        if (!dailyData[date]) {
          dailyData[date] = { ga4Count: 0, ga4Revenue: 0, floodCount: 0, floodRevenue: 0 }
        }
        if (ga4Key) {
          dailyData[date][ga4Key + 'Count']++
          dailyData[date][ga4Key + 'Revenue'] += revenue
        }
        if (floodKey) {
          dailyData[date][floodKey + 'Count']++
          dailyData[date][floodKey + 'Revenue'] += revenue
        }
      }
    }

    processDaily(onlyGa4Transactions, 'ga4')
    processDaily(onlyFloodTransactions, null, 'flood')
    processDaily(bothTransactions, 'ga4', 'flood')

    // Converte para array e ordena por data
    const sortedDailyData = Object.entries(dailyData)
      .map(([date, data]) => ({ date, ...data }))
      .sort((a, b) => new Date(a.date) - new Date(b.date))

    // Monta o objeto de resultado final
    const sumRevenue = transactionsMap =>
      Array.from(transactionsMap.values()).reduce((acc, current) => acc + current.revenue, 0)

    const results = {
      analysisId,
      dailyData: sortedDailyData,
      totals: {
        both: {
          count: bothTransactions.size,
          revenue: sumRevenue(bothTransactions),
        },
        onlyGa4: {
          count: onlyGa4Transactions.size,
          revenue: sumRevenue(onlyGa4Transactions),
        },
        onlyFloodlight: {
          count: onlyFloodTransactions.size,
          revenue: sumRevenue(onlyFloodTransactions),
        },
      },
    }

    res.json(results)
  } catch (error) {
    console.error('Error during analysis:', error)
    res
      .status(500)
      .json({ error: 'Falha ao processar os arquivos. Verifique o formato das colunas, incluindo a de data.' })
  }
})

// Nova rota para download
app.get('/download/:analysisId/:type', (req, res) => {
  const { analysisId, type } = req.params
  const analysisData = analysisCache.get(analysisId)

  if (!analysisData) {
    return res.status(404).send('Análise não encontrada ou expirada.')
  }

  const transactionIds = analysisData[type]
  if (!transactionIds) {
    return res.status(400).send('Tipo de dado inválido.')
  }

  // Cria o conteúdo do CSV
  const csvContent = 'transaction_id\r\n' + transactionIds.join('\r\n')

  // Define os headers para forçar o download
  res.setHeader('Content-Type', 'text/csv')
  res.setHeader('Content-Disposition', `attachment; filename=${type}-transactions-${analysisId}.csv`)
  res.send(csvContent)
})

// Inicia o servidor
app.listen(port, () => {
  console.log(`Servidor rodando em http://localhost:${port}`)
})
