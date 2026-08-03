import { useCallback, useEffect, useState } from 'react'
import { Pencil, Plus } from 'lucide-react'
import { Button } from '@/components/ui/Button'
import { Field } from '@/components/ui/Field'
import { Select } from '@/components/ui/Select'
import { Modal } from '@/components/ui/Modal'
import { Spinner } from '@/components/ui/Spinner'
import { EmptyState, PageHeader } from '@/components/ui/States'
import type { IdName } from '@/types'
import {
  createCareer,
  createGeneralArea,
  createOffice,
  createSpecificArea,
  getCareers,
  getGeneralAreas,
  getOffices,
  getSpecificAreas,
  updateCareer,
  updateGeneralArea,
  updateOffice,
  updateSpecificArea,
} from '@/lib/adminResources'

/*
| Dados de referência: carreiras, ofícios e áreas de conhecimento.
|
| São as listas que o cadastro do usuário oferece. Se falta um ofício aqui,
| ninguém daquela função consegue se cadastrar — antes desta tela a única saída
| era inserir direto no banco.
|
| Ofícios e áreas específicas são filhos de um pai (carreira / área geral), daí
| as duas colunas: escolher o pai à esquerda filtra e habilita os filhos.
*/

type Aba = 'carreiras' | 'areas'

function ListaEditavel({
  titulo,
  descricao,
  itens,
  carregando,
  selecionado,
  onSelecionar,
  onNovo,
  onEditar,
  desabilitado,
  mensagemVazia,
}: {
  titulo: string
  descricao?: string
  itens: IdName[]
  carregando: boolean
  selecionado?: number | null
  onSelecionar?: (id: number) => void
  onNovo: () => void
  onEditar: (item: IdName) => void
  desabilitado?: boolean
  mensagemVazia: string
}) {
  return (
    <div className="rounded-2xl border border-slate-200 bg-white">
      <div className="flex items-start justify-between gap-4 border-b border-slate-200 p-4">
        <div>
          <h2 className="font-semibold text-navy-900">{titulo}</h2>
          {descricao && <p className="mt-0.5 text-sm text-slate-500">{descricao}</p>}
        </div>
        <Button size="sm" variant="secondary" onClick={onNovo} disabled={desabilitado}>
          <Plus size={15} />
          Novo
        </Button>
      </div>

      {carregando ? (
        <div className="grid place-items-center py-10">
          <Spinner />
        </div>
      ) : itens.length === 0 ? (
        <p className="p-6 text-sm text-slate-500">{mensagemVazia}</p>
      ) : (
        <ul className="max-h-96 divide-y divide-slate-100 overflow-y-auto">
          {itens.map((item) => (
            <li
              key={item.id}
              className={
                selecionado === item.id
                  ? 'flex items-center justify-between gap-3 bg-brand-50 px-4 py-2.5'
                  : 'flex items-center justify-between gap-3 px-4 py-2.5 hover:bg-slate-50'
              }
            >
              <button
                type="button"
                className="flex-1 text-left text-sm text-navy-900"
                onClick={() => onSelecionar?.(item.id)}
              >
                {item.name}
              </button>
              <button
                type="button"
                className="text-slate-400 hover:text-brand-700"
                aria-label={`Editar ${item.name}`}
                onClick={() => onEditar(item)}
              >
                <Pencil size={15} />
              </button>
            </li>
          ))}
        </ul>
      )}
    </div>
  )
}

type Edicao = {
  titulo: string
  valor: string
  paiId?: number | null
  opcoesPai?: IdName[]
  rotuloPai?: string
  salvar: (descricao: string, paiId: number | null) => Promise<void>
}

export default function ReferenceDataPage() {
  const [aba, setAba] = useState<Aba>('carreiras')

  const [carreiras, setCarreiras] = useState<IdName[]>([])
  const [oficios, setOficios] = useState<IdName[]>([])
  const [carreiraSel, setCarreiraSel] = useState<number | null>(null)

  const [areas, setAreas] = useState<IdName[]>([])
  const [especificas, setEspecificas] = useState<IdName[]>([])
  const [areaSel, setAreaSel] = useState<number | null>(null)

  const [carregando, setCarregando] = useState(true)
  const [carregandoFilhos, setCarregandoFilhos] = useState(false)
  const [edicao, setEdicao] = useState<Edicao | null>(null)
  const [valor, setValor] = useState('')
  const [paiId, setPaiId] = useState<string>('')
  const [salvando, setSalvando] = useState(false)
  const [erro, setErro] = useState<string | null>(null)

  const carregarPais = useCallback(async () => {
    setCarregando(true)
    try {
      const [c, a] = await Promise.all([getCareers(), getGeneralAreas()])
      setCarreiras(c)
      setAreas(a)
    } finally {
      setCarregando(false)
    }
  }, [])

  useEffect(() => {
    carregarPais()
  }, [carregarPais])

  const carregarOficios = useCallback(async (careerId: number) => {
    setCarregandoFilhos(true)
    try {
      setOficios(await getOffices(careerId))
    } finally {
      setCarregandoFilhos(false)
    }
  }, [])

  const carregarEspecificas = useCallback(async (generalId: number) => {
    setCarregandoFilhos(true)
    try {
      setEspecificas(await getSpecificAreas(generalId))
    } finally {
      setCarregandoFilhos(false)
    }
  }, [])

  function abrir(e: Edicao) {
    setEdicao(e)
    setValor(e.valor)
    setPaiId(e.paiId ? String(e.paiId) : '')
    setErro(null)
  }

  async function salvar() {
    if (!edicao) return
    setSalvando(true)
    setErro(null)
    try {
      await edicao.salvar(valor.trim(), paiId ? Number(paiId) : null)
      setEdicao(null)
      await carregarPais()
      if (carreiraSel) await carregarOficios(carreiraSel)
      if (areaSel) await carregarEspecificas(areaSel)
    } catch (e) {
      setErro(e instanceof Error ? e.message : 'Não foi possível salvar.')
    } finally {
      setSalvando(false)
    }
  }

  const precisaPai = Boolean(edicao?.opcoesPai)
  const podeSalvar = valor.trim().length > 0 && (!precisaPai || Boolean(paiId)) && !salvando

  return (
    <>
      <PageHeader
        title="Dados de referência"
        subtitle="Carreiras, ofícios e áreas de conhecimento oferecidos no cadastro. Faltando um item aqui, ninguém daquela função consegue se cadastrar."
      />

      <div className="mb-6 flex gap-1 rounded-lg bg-slate-100 p-1">
        {([
          ['carreiras', 'Carreiras e ofícios'],
          ['areas', 'Áreas de conhecimento'],
        ] as [Aba, string][]).map(([id, rotulo]) => (
          <button
            key={id}
            type="button"
            onClick={() => setAba(id)}
            className={
              aba === id
                ? 'flex-1 rounded-md bg-white px-3 py-2 text-sm font-medium text-navy-900 shadow-sm'
                : 'flex-1 rounded-md px-3 py-2 text-sm font-medium text-slate-600 hover:text-navy-900'
            }
          >
            {rotulo}
          </button>
        ))}
      </div>

      {aba === 'carreiras' ? (
        <div className="grid gap-4 lg:grid-cols-2">
          <ListaEditavel
            titulo="Carreiras"
            descricao="Ex.: Docente, Técnico-Administrativo"
            itens={carreiras}
            carregando={carregando}
            selecionado={carreiraSel}
            onSelecionar={(id) => {
              setCarreiraSel(id)
              carregarOficios(id)
            }}
            onNovo={() =>
              abrir({
                titulo: 'Nova carreira',
                valor: '',
                salvar: async (d) => createCareer(d),
              })
            }
            onEditar={(item) =>
              abrir({
                titulo: 'Editar carreira',
                valor: item.name,
                salvar: async (d) => updateCareer(item.id, d),
              })
            }
            mensagemVazia="Nenhuma carreira cadastrada."
          />

          <ListaEditavel
            titulo="Ofícios"
            descricao={
              carreiraSel
                ? 'Ofícios da carreira selecionada'
                : 'Selecione uma carreira à esquerda'
            }
            itens={carreiraSel ? oficios : []}
            carregando={carregandoFilhos}
            desabilitado={!carreiraSel}
            onNovo={() =>
              abrir({
                titulo: 'Novo ofício',
                valor: '',
                paiId: carreiraSel,
                opcoesPai: carreiras,
                rotuloPai: 'Carreira',
                salvar: async (d, pai) => createOffice(Number(pai), d),
              })
            }
            onEditar={(item) =>
              abrir({
                titulo: 'Editar ofício',
                valor: item.name,
                paiId: carreiraSel,
                opcoesPai: carreiras,
                rotuloPai: 'Carreira',
                salvar: async (d, pai) => updateOffice(item.id, Number(pai), d),
              })
            }
            mensagemVazia={
              carreiraSel ? 'Esta carreira ainda não tem ofícios.' : 'Selecione uma carreira.'
            }
          />
        </div>
      ) : (
        <div className="grid gap-4 lg:grid-cols-2">
          <ListaEditavel
            titulo="Áreas gerais"
            descricao="Ex.: Educação Física, Matemática"
            itens={areas}
            carregando={carregando}
            selecionado={areaSel}
            onSelecionar={(id) => {
              setAreaSel(id)
              carregarEspecificas(id)
            }}
            onNovo={() =>
              abrir({
                titulo: 'Nova área geral',
                valor: '',
                salvar: async (d) => createGeneralArea(d),
              })
            }
            onEditar={(item) =>
              abrir({
                titulo: 'Editar área geral',
                valor: item.name,
                salvar: async (d) => updateGeneralArea(item.id, d),
              })
            }
            mensagemVazia="Nenhuma área cadastrada."
          />

          <ListaEditavel
            titulo="Áreas específicas"
            descricao={areaSel ? 'Especialidades da área selecionada' : 'Selecione uma área à esquerda'}
            itens={areaSel ? especificas : []}
            carregando={carregandoFilhos}
            desabilitado={!areaSel}
            onNovo={() =>
              abrir({
                titulo: 'Nova área específica',
                valor: '',
                paiId: areaSel,
                opcoesPai: areas,
                rotuloPai: 'Área geral',
                salvar: async (d, pai) => createSpecificArea(Number(pai), d),
              })
            }
            onEditar={(item) =>
              abrir({
                titulo: 'Editar área específica',
                valor: item.name,
                paiId: areaSel,
                opcoesPai: areas,
                rotuloPai: 'Área geral',
                salvar: async (d, pai) => updateSpecificArea(item.id, Number(pai), d),
              })
            }
            mensagemVazia={areaSel ? 'Esta área ainda não tem especialidades.' : 'Selecione uma área.'}
          />
        </div>
      )}

      {carreiras.length === 0 && areas.length === 0 && !carregando && (
        <EmptyState title="Nada cadastrado ainda" description="Comece criando uma carreira ou uma área." />
      )}

      <Modal open={edicao !== null} onClose={() => setEdicao(null)} title={edicao?.titulo ?? ''}>
        <div className="flex flex-col gap-4">
          {edicao?.opcoesPai && (
            <Select
              label={edicao.rotuloPai ?? 'Pertence a'}
              value={paiId}
              onChange={(e) => setPaiId(e.target.value)}
              options={edicao.opcoesPai.map((o) => ({ value: String(o.id), label: o.name }))}
            />
          )}

          <Field
            label="Descrição"
            value={valor}
            onChange={(e) => setValor(e.target.value)}
            placeholder="Nome como aparecerá no cadastro"
          />

          {erro && <p className="rounded-lg bg-red-50 px-3 py-2 text-sm text-red-700">{erro}</p>}

          <div className="flex justify-end gap-2">
            <Button variant="ghost" onClick={() => setEdicao(null)} disabled={salvando}>
              Cancelar
            </Button>
            <Button variant="match" onClick={salvar} disabled={!podeSalvar}>
              {salvando ? 'Salvando…' : 'Salvar'}
            </Button>
          </div>
        </div>
      </Modal>
    </>
  )
}
