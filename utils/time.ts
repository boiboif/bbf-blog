import moment from 'moment'

const format = (format: string) => (date: moment.Moment | string) => moment(date).format(format)

const formatObjArr =
    (keys: string[], rules: typeof formatDate) =>
    <T extends Record<string, any>>(arr: T[]) =>
        arr.map((item) => {
            return keys.reduce((acc, cur) => {
                return {
                    ...acc,
                    [cur]: rules(item[cur]) as string,
                }
            }, item)
        })

export const formatDate = format('YYYY-MM-DD')
export const formatObjArrDate = formatObjArr(['createdAt', 'updatedAt'], formatDate)
