import React from 'react'

import { CategoryList, PageLayout } from '../components'
import { useStore } from '../context/StoreContext'

export const ExpensesSettingsPage: React.FC = () => {
    const { expenseCategoryStore, transactionStore } = useStore()

    return (
        <PageLayout title="Settings">
            <CategoryList
                categories={expenseCategoryStore.categories}
                onCategoryAdd={(label) => expenseCategoryStore.add(label)}
                onCategoryEdit={(id, newLabel) =>
                    expenseCategoryStore.rename(id, newLabel)
                }
                onCategoryDelete={async (id) => {
                    await transactionStore.resetCategory(id)
                    await expenseCategoryStore.remove(id)
                }}
            />
        </PageLayout>
    )
}
