type DataPoint = {
	name: string
	dayNumber: number
	date: Date
	uv: number
	pv: number
	amt: number
}

export const generateRandomData = (count: number): DataPoint[] => {
	const data: DataPoint[] = []

	for (let i = 0; i < count; i++) {
		const minute = 60000
		const minutesBefore = Math.floor(Math.random() * 10) + 1
		const timeGapLength = Math.random() > 0.8
		const timeGap = timeGapLength ? minute * 60 * 24 : minute
		const date = new Date((data[i - 1]?.date ?? new Date()).getTime() - minutesBefore * timeGap)
		data.push({
			name: date.toLocaleDateString("en-US", {
				day: "2-digit",
				month: "2-digit",
				year: "2-digit",
			}),
			dayNumber: i,
			date: date,
			uv: Math.floor(Math.random() * 5000),
			pv: Math.floor(Math.random() * 5000),
			amt: Math.floor(Math.random() * 3000),
		})
	}

	return data.reverse()
}
