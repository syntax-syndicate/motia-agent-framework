import { PropsWithChildren } from 'react'
import { BaseNode } from './base-node'
import { Emits } from './emits'
import { EventNodeProps } from './node-props'
import { Subscribe } from './subscribe'

type Props = PropsWithChildren<
  EventNodeProps & {
    excludePubsub?: boolean
    className?: string
  }
>

export const EventNode = (props: Props) => {
  const { data, excludePubsub, children } = props

  return (
    <BaseNode
      variant="event"
      title={data.name}
      language={data.language}
      disableSourceHandle={!data.emits.length && !data.virtualEmits?.length}
      disableTargetHandle={!data.subscribes.length && !data.virtualSubscribes?.length}
    >
      {data.description && <div className="text-sm max-w-[300px] text-white/60">{data.description}</div>}
      {children}
      {!excludePubsub && (
        <div className="space-y-2 pt-2 border-t border-white/10">
          <Subscribe data={data} />
        </div>
      )}
      <Emits emits={data.emits} />
    </BaseNode>
  )
}
