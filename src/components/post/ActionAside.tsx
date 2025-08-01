import { sponsor, site } from '@/config.json'
import { motion } from 'framer-motion'
import * as QR from 'qrcode.react'
import { useAtomValue } from 'jotai'
import { metaSlugAtom, metaTitleAtom } from '@/store/metaInfo'
import clsx from 'clsx'
import { toast } from 'react-toastify'
import { useModal } from '@/components/ui/modal'

interface ShareData {
  url: string
  text: string
}

const shareList = [
  {
    name: '微博',
    icon: 'icon-weibo',
    onClick: (data: ShareData) => {
      console.log('分享到微博:', data)
      const shareUrl = `https://service.weibo.com/share/share.php?url=${encodeURIComponent(data.url)}&title=${encodeURIComponent(data.text)}`
      console.log('微博分享链接:', shareUrl)
      const windowRef = window.open(shareUrl, '_blank')
      if (!windowRef) {
        toast.error('浏览器阻止了弹出窗口，请允许弹出窗口后重试')
      }
    },
  },
  {
    name: 'QQ',
    icon: 'icon-qq',
    onClick: (data: ShareData) => {
      console.log('分享到QQ:', data)
      const shareUrl = `https://connect.qq.com/widget/shareqq/index.html?url=${encodeURIComponent(data.url)}&title=${encodeURIComponent(data.text)}&summary=${encodeURIComponent(data.text)}`
      console.log('QQ分享链接:', shareUrl)
      const windowRef = window.open(shareUrl, '_blank')
      if (!windowRef) {
        toast.error('浏览器阻止了弹出窗口，请允许弹出窗口后重试')
      }
    },
  },
  {
    name: 'Twitter',
    icon: 'icon-x',
    onClick: (data: ShareData) => {
      const shareUrl = `https://twitter.com/intent/tweet?url=${encodeURIComponent(data.url)}&text=${encodeURIComponent(data.text)}&via=${encodeURIComponent(site.title)}`
      console.log('Twitter分享链接:', shareUrl)
      const windowRef = window.open(shareUrl, '_blank')
      if (!windowRef) {
        toast.error('浏览器阻止了弹出窗口，请允许弹出窗口后重试')
      }
    },
  },
  {
    name: '复制链接',
    icon: 'icon-link',
    onClick: (data: ShareData) => {
      navigator.clipboard.writeText(data.url)
      toast.success('已复制到剪贴板')
    },
  },
]

export function ActionAside() {
  return (
    <div
      className="absolute left-0 bottom-0 flex flex-col gap-4"
      style={{
        transform: 'translateY(calc(100% + 24px))',
      }}
    >
      <ShareButton />
    </div>
  )
}

function ShareButton() {
  const postSlug = useAtomValue(metaSlugAtom)
  const postTitle = useAtomValue(metaTitleAtom)
  const { present } = useModal()

  const url = new URL(postSlug, site.url).href
  const text = `嘿，我发现了一片宝藏文章：「${postTitle}」！快来看看吧！`

  const openModal = () => {
    present({
      content: <ShareModal url={url} text={text} />,
    })
  }

  return (
    <button
      type="button"
      aria-label="Share this post"
      className="size-6 text-xl leading-none hover:text-accent"
      onClick={() => openModal()}
    >
      <i className="iconfont icon-share"></i>
    </button>
  )
}

function ShareModal({ url, text }: { url: string; text: string }) {
  // 处理分享点击事件
  const handleShareClick = (item: typeof shareList[0]) => {
    console.log(`点击分享到${item.name}`)
    try {
      item.onClick({ url, text })
    } catch (error) {
      console.error(`分享到${item.name}失败:`, error)
      toast.error(`分享到${item.name}失败，请稍后再试`)
    }
  }

  return (
    <motion.div
      className="bg-primary rounded-lg p-2 min-w-[420px] border border-primary flex flex-col"
      initial={{ opacity: 0, scale: 0.8 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 0.8 }}
    >
      <h2 className="px-3 py-1 font-bold">分享此内容</h2>
      <hr className="my-2 border-primary" />
      <div className="px-3 py-2 grid grid-cols-[180px_auto] gap-3">
        <QR.QRCodeSVG value={url} size={180} />
        <div className="flex flex-col gap-2">
          <div className="text-sm">分享到...</div>
          <ul className="flex flex-col gap-2">
            {shareList.map((item) => (
              <li
                className="px-2 py-1 flex gap-2 cursor-pointer rounded-md hover:bg-secondary transition-all duration-200"
                key={item.name}
                onClick={() => handleShareClick(item)}
                role="button"
                aria-label={`Share to ${item.name}`}
              >
                <i className={clsx('iconfont text-accent', item.icon)}></i>
                <span>{item.name}</span>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </motion.div>
  )
}
