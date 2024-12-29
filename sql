WITH context AS (
    SELECT 
        name,
        chunk_text,
        snowflake.cortex.embed_text_1024('snowflake-arctic-embed-l-v2.0', chunk_text) AS embedding
    FROM 
        "HELP_PM"."PUBLIC"."CONTENT_CHUNKS"
    QUALIFY ROW_NUMBER() OVER (PARTITION BY name ORDER BY name) = 1
    ORDER BY 
        vector_cosine_similarity(embedding, snowflake.cortex.embed_text_1024('snowflake-arctic-embed-l-v2.0', $question)) DESC
    LIMIT 10
),
concatenated_context AS (
    SELECT 
        LISTAGG(chunk_text, ' ') WITHIN GROUP (ORDER BY name) AS combined_context
    FROM context
)
SELECT 
    snowflake.cortex.complete(
        'llama3.1-8b', 
        'Use the provided context to answer the question. Be concise. ' || 
        '###
        CONTEXT: ' || concatenated_context.combined_context || '
        ###
        QUESTION: ' || $question || '
        ANSWER: '
    ) AS response
FROM concatenated_context;