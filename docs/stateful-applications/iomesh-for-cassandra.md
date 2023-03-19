---
id: iomesh-for-cassandra
title: IOMesh for Cassandra
sidebar_label: IOMesh for Cassandra
---

**Prerequisite**

Verify the IOMesh cluster is already deployed.

**Procedure**
1. Create a YAML file `iomesh-cassandra-sc.yaml` to create a StorageClass. You can also directly choose the default StorageClass.

    ```yaml
    kind: StorageClass
    apiVersion: storage.k8s.io/v1
    metadata:
      name: iomesh-cassandra-sc
    provisioner: com.iomesh.csi-driver # The driver.name in `IOMesh.yaml` when deploying IOMesh cluster.
    reclaimPolicy: Retain
    allowVolumeExpansion: true
    parameters:
      csi.storage.k8s.io/fstype: "ext4"
      replicaFactor: "2"
      thinProvision: "true"
    ```

2. Run the following command to apply the YAML file.

    ```bash
    kubectl apply -f iomesh-cassandra-sc.yaml
    ```
3. Create a headless service which is needed for DNS lookups between Cassandra Pods and clients within your cluster.
    ```yaml
    apiVersion: v1
    kind: Service
    metadata:
      labels:
        app: cassandra
      name: cassandra
    spec:
      clusterIP: None
      ports:
      - port: 9042
      selector:
        app: cassandra
    ```

4. Run the following command to apply the YAML file.

    ```bash
    kubectl apply -f cassandra-service.yaml
    ```
5. Create a Statefulset for deploying Cassandra cluster.

    ```yaml
    apiVersion: apps/v1
    kind: StatefulSet
    metadata:
      name: cassandra
      labels:
        app: cassandra
    spec:
      serviceName: cassandra
      replicas: 3
      selector:
        matchLabels:
          app: cassandra
      template:
        metadata:
          labels:
            app: cassandra
        spec:
          terminationGracePeriodSeconds: 1800
          containers:
          - name: cassandra
            image: gcr.io/google-samples/cassandra:v13
            imagePullPolicy: Always
            ports:
            - containerPort: 7000
              name: intra-node
            - containerPort: 7001
              name: tls-intra-node
            - containerPort: 7199
              name: jmx
            - containerPort: 9042
              name: cql
            resources:
              limits:
                cpu: "500m"
                memory: 1Gi
              requests:
                cpu: "500m"
                memory: 1Gi
            securityContext:
              capabilities:
                add:
                  - IPC_LOCK
            lifecycle:
              preStop:
                exec:
                  command:
                  - /bin/sh
                  - -c
                  - nodetool drain
            env:
              - name: MAX_HEAP_SIZE
                value: 512M
              - name: HEAP_NEWSIZE
                value: 100M
              - name: CASSANDRA_SEEDS
                value: "cassandra-0.cassandra.default.svc.cluster.local"
              - name: CASSANDRA_CLUSTER_NAME
                value: "K8Demo"
              - name: CASSANDRA_DC
                value: "DC1-K8Demo"
              - name: CASSANDRA_RACK
                value: "Rack1-K8Demo"
              - name: POD_IP
                valueFrom:
                  fieldRef:
                    fieldPath: status.podIP
            readinessProbe:
              exec:
                command:
                - /bin/bash
                - -c
                - /ready-probe.sh
              initialDelaySeconds: 15
              timeoutSeconds: 5
            volumeMounts:
            - name: cassandra-data
              mountPath: /cassandra_data
      volumeClaimTemplates:
      - metadata:
          name: cassandra-data
        spec:
          accessModes: "ReadWriteOnce"
          storageClassName: iomesh-cassandra-sc # The storageClass you created in the first step.
          resources:
            requests:
              storage: 10Gi
    ```

6. Run the following command to apply the YAML file.


    ```bash
    kubectl apply -f cassandra-statefulset.yaml
    ```

    Persistent volumes will be created for each Cassandra pod, and each persistent volume will have configurations such as filetype and replication factor as configured in the StorageClass.

    Once done, you can expand, snapshot, or clone volumes where Cassandra data are located. For details, refer to [Volume Operations] and [VolumeSnapshot Operations].
