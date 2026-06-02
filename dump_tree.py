import pandas as pd
import json

df_csv = pd.read_csv('/Users/apple/Desktop/Maff.uz-main/products_hierarchy_202604281544.csv', sep=';', dtype=str)

# Build tree
nodes = {}
for _, row in df_csv.iterrows():
    if row['ЭтоГруппа'].lower() == 'true':
        nodes[row['uuid']] = {
            'name': row['Наименование'],
            'parent': row['Родитель_Key'],
            'level': int(row['Уровень']),
            'children': []
        }

tree = []
for uid, node in nodes.items():
    parent_id = node['parent']
    if parent_id == '00000000-0000-0000-0000-000000000000':
        tree.append(node)
    elif parent_id in nodes:
        nodes[parent_id]['children'].append(node)

def print_tree(node, prefix=""):
    print(f"{prefix}- {node['name']}")
    for child in sorted(node['children'], key=lambda x: x['name']):
        print_tree(child, prefix + "  ")

for root in sorted(tree, key=lambda x: x['name']):
    print_tree(root)
