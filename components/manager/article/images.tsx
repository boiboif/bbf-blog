import { App, Form, Input, Modal } from 'antd'
import type { BytemdEditorContext, BytemdPlugin } from 'bytemd'
import { useMemo, useState } from 'react'
import { imageExtensions, imageFormatsHelp, imageMarkdown, maxImageBytes, maxServerImageBytes, readImageType } from '@/utils/markdownImage'

type Editor = BytemdEditorContext['editor']

const icon = (label: string, paths: string) =>
    `<button type="button" aria-label="${label}"><svg aria-hidden="true" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">${paths}</svg></button>`
const photo = '<rect x="2" y="3" width="16" height="16" rx="2"/><path d="m2 15 5-5 5 5 2-2"/><circle cx="13" cy="7" r="1"/>'
const uploadIcon = icon('上传本地图片', photo + '<path d="M19 22v-7m-3 3 3-3 3 3"/>')
const urlIcon = icon('插入网络图片', '<path d="m10 13 4-4m-6 2-3 3a4 4 0 0 0 6 6l3-3m-4-9 3-3a4 4 0 0 1 6 6l-3 3"/>')

async function requestUpload(path: string, body: File | Record<string, unknown>) {
    const isFile = body instanceof File
    const response = await fetch(path, {
        method: 'POST',
        headers: {
            authorization: localStorage.getItem('token') ?? '',
            ...(!isFile && { 'content-type': 'application/json' }),
        },
        body: isFile ? body : JSON.stringify(body),
    })
    const result = await response.json().catch(() => null)
    if (!response.ok || !result?.data) throw new Error(result?.message || '上传失败，请重试')
    return result.data
}

async function uploadLarge(file: File) {
    const contentType = await readImageType(file.size, async length => new Uint8Array(await file.slice(0, length).arrayBuffer()))
    if (!contentType) throw new Error(imageFormatsHelp)
    const path = '/api/images/direct'
    const { uploadUrl, ticket } = await requestUpload(path, { action: 'prepare', size: file.size, contentType })
    const response = await fetch(uploadUrl, {
        method: 'PUT', credentials: 'omit', referrerPolicy: 'no-referrer',
        headers: { 'content-type': 'application/octet-stream' }, body: file,
    })
    if (!response.ok) throw new Error('图片直传失败，请重试')
    return requestUpload(path, { action: 'complete', ticket })
}

async function upload(file: File) {
    if (file.size > maxImageBytes || !file.size) throw new Error(imageFormatsHelp)
    const { url } = file.size > maxServerImageBytes ? await uploadLarge(file) : await requestUpload('/api/images', file)
    return imageMarkdown(url, file.name.replace(/\.[^.]+$/, ''))
}

function ImageUrlDialog({ editor, close }: { editor: Editor; close: () => void }) {
    const [form] = Form.useForm<{ url: string; alt: string }>()
    return (
        <Modal open title='插入网络图片' okText='插入' onOk={() => form.submit()} onCancel={close}>
            <Form form={form} layout='vertical' initialValues={{ alt: editor.getSelection() }}
                onFinish={({ url, alt }) => {
                    try {
                        editor.replaceSelection(imageMarkdown(url, alt ?? ''))
                        close()
                        editor.focus()
                    } catch {
                        form.setFields([{ name: 'url', errors: ['请输入有效的 HTTP 或 HTTPS 图片地址'] }])
                    }
                }}
            >
                <Form.Item name='url' label='图片地址' rules={[{ required: true, message: '请输入图片地址' }]}>
                    <Input autoFocus type='url' placeholder='https://…' onPressEnter={() => form.submit()} />
                </Form.Item>
                <Form.Item name='alt' label='图片说明'>
                    <Input onPressEnter={() => form.submit()} />
                </Form.Item>
            </Form>
        </Modal>
    )
}

export function useArticleImages() {
    const { message } = App.useApp()
    const [urlEditor, setUrlEditor] = useState<Editor | null>(null)
    const [pending, setPending] = useState(0)

    const plugin = useMemo<BytemdPlugin>(() => {
        async function insertFiles(editor: Editor, files: File[], position = editor.getCursor()) {
            if (!files.length) return
            const marker = editor.setBookmark(position, { insertLeft: true })
            setPending(n => n + 1)
            try {
                const images: string[] = []
                for (const file of files) {
                    try {
                        images.push(await upload(file))
                    } catch (error) {
                        void message.error(`${file.name}：${error instanceof Error ? error.message : '上传失败'}`)
                    }
                }
                const at = marker.find()
                if (at && images.length) editor.replaceRange(images.join('\n\n'), at)
            } finally {
                marker.clear()
                setPending(n => n - 1)
            }
        }
        return {
            actions: [
                { title: '插入网络图片', icon: urlIcon, handler: { type: 'action', click: ({ editor }) => setUrlEditor(editor) } },
                { title: `上传本地图片（${imageFormatsHelp}）`, icon: uploadIcon, handler: {
                    type: 'action', click: async ({ editor, selectFiles }) => {
                        const files = await selectFiles({ accept: Object.keys(imageExtensions).join(','), multiple: true })
                        if (files) await insertFiles(editor, Array.from(files))
                    },
                } },
            ],
            editorEffect({ editor }) {
                const onPaste = (_: Editor, event: ClipboardEvent) => {
                    const files = Array.from(event.clipboardData?.files ?? [])
                    if (!files.length) return
                    event.preventDefault()
                    void insertFiles(editor, files)
                }
                const onDrop = (_: Editor, event: DragEvent) => {
                    const files = Array.from(event.dataTransfer?.files ?? [])
                    if (!files.length) return
                    event.preventDefault()
                    const position = editor.coordsChar({ left: event.clientX, top: event.clientY }, 'window')
                    void insertFiles(editor, files, position)
                }
                editor.on('paste', onPaste)
                editor.on('drop', onDrop)
                return () => {
                    editor.off('paste', onPaste)
                    editor.off('drop', onDrop)
                }
            },
        }
    }, [message])

    return {
        plugin,
        uploading: pending > 0,
        dialog: urlEditor && <ImageUrlDialog editor={urlEditor} close={() => setUrlEditor(null)} />,
    }
}
