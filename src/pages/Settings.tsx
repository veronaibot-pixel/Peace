export default function Settings() {
  return (
    <div className="max-w-2xl mx-auto space-y-6">
      <h1 className="text-2xl font-bold text-gray-800 dark:text-gray-100">
        ⚙️ Settings
      </h1>

      <div className="bg-white dark:bg-gray-800 rounded-xl p-6 border border-gray-200 dark:border-gray-700 space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <p className="font-medium text-gray-800 dark:text-gray-100">Daily Goal</p>
            <p className="text-sm text-gray-500">Cards to review per day</p>
          </div>
          <select className="px-3 py-2 border border-gray-200 dark:border-gray-700 rounded-lg bg-white dark:bg-gray-800 text-gray-800 dark:text-gray-100">
            <option>10</option>
            <option>20</option>
            <option>30</option>
            <option>50</option>
          </select>
        </div>

        <hr className="border-gray-200 dark:border-gray-700" />

        <div className="flex items-center justify-between">
          <div>
            <p className="font-medium text-gray-800 dark:text-gray-100">Pet Name</p>
            <p className="text-sm text-gray-500">Rename your companion</p>
          </div>
          <input
            type="text"
            defaultValue="Peace"
            className="px-3 py-2 border border-gray-200 dark:border-gray-700 rounded-lg bg-white dark:bg-gray-800 text-gray-800 dark:text-gray-100 w-32"
          />
        </div>

        <hr className="border-gray-200 dark:border-gray-700" />

        <div className="flex items-center justify-between">
          <div>
            <p className="font-medium text-gray-800 dark:text-gray-100">Ghost Mode</p>
            <p className="text-sm text-gray-500">Pet won't block mouse clicks</p>
          </div>
          <input type="checkbox" className="w-5 h-5 accent-purple-600" />
        </div>
      </div>
    </div>
  )
}
