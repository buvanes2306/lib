import pandas as pd

# Read JSON with options to handle mixed types and preserve data
df = pd.read_json('exported_data.json', dtype=False)

# Convert accNo to string to handle mixed integer/string types
df['accNo'] = df['accNo'].astype(str)

# Extract the actual ID from the nested $oid structure
df['_id'] = df['_id'].apply(lambda x: x.get('$oid') if isinstance(x, dict) else x)

# Handle null values in location
df['rack'] = df['location'].apply(lambda x: x.get('rack') if isinstance(x, dict) else None)
df['shelf'] = df['location'].apply(lambda x: x.get('shelf') if isinstance(x, dict) else None)

# Print the dataframe to verify
print(df.head())
print("\nColumn dtypes:")
print(df.dtypes)
print("\nNaN values per column:")
print(df.isnull().sum())
