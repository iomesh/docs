---
id: cluster-operations
title: Cluster Operations
sidebar_label: Cluster Operations
---

IOMesh Cluster support dynamicly scale or upgrade cluster component.

## Scaling IOMesh storage cluster

### Meta Server 

IOMesh Meta Server is the place to store the meta data of the whole cluster. Include data replicas infomation, recover control etc.

So highly _recommanded_ run 3 meta server in production environment on different node for HA. If you just deployed just 1 meta server before for tryout. Now you can follow the steps to scale up the meta server.

1. Prepare hostpath dir

> **_NOTE_: If you done this before in the installation stage, you can skip this step.**

```bash
# Execute the following commands on each worker node
mkdir -p /mnt/iomesh/hostpath
mount /dev/<formatted-partition> /mnt/iomesh/hostpath
```

2. Export default config `iomesh-values.yaml` from Chart

> **_NOTE_: If you already exported the config, you can skip this step.**

```bash
helm show values iomesh/iomesh > iomesh-values.yaml
```

3. Edit `iomesh-values.yaml`, change `replicaCount` to 3

Example:
```yaml
meta:
  replicaCount: 3
```

4. Edit `podPolicy` if you need

Example:
```yaml
podPolicy:
  affinity:
    nodeAffinity:
      requiredDuringSchedulingIgnoredDuringExecution:
        nodeSelectorTerms:
        - matchExpressions:
          - key: kubernetes.io/e2e-az-name
            operator: In
            values:
            - e2e-az1
            - e2e-az2
```

5. Apply config

> **_NOTE_: `my-iomesh` is release name, maybe you want to modify it.**

```bash
helm upgrade --namespace iomesh-system my-iomesh iomesh/iomesh --values iomesh-values.yaml
```

### Chunk Server

#### Scale up

After a new storage node was added to your cluster, you probably want to scale up the storage cluster to the new node.

IOMesh storage server called Chunk Server.

Follow the steps below to scale up or down the chunk server.

> **_NOTE_: Highly _recommanded_ deploy more than 1 chunk server in production environment on different node to offer topology safety and to boost up the performance.**

1. Export default config `iomesh-values.yaml` from Chart

> **_NOTE_: If you already exported the config, you can skip this step.**

```bash
helm show values iomesh/iomesh > iomesh-values.yaml
```

2. Edit `iomesh-values.yaml`

```yaml
chunk:
  replicaCount: 3
  podPolicy: # change the pod policy make chunk server pod deploy to specific node you want.
    nodeSelector: 
      matchLabels:
        storage: true
```

3. Follow [mount device][1] to checkout the block devices on the new storage node can fully selected by selector.

4. Apply the IOMesh Cluster config

> **_NOTE_: `my-iomesh` is release name, maybe you want to modify it.**

```bash
helm upgrade --namespace iomesh-system my-iomesh iomesh/iomesh --values iomesh-values.yaml
```

5. Wait new chunk server pod ready.

```bash
watch kubectl get pod --namespace iomesh-system
```

6. Check device mount successfully.

<!--TODO-->

#### Scale out

If you want to scale out a running cluster on specific node. Follow the step below.

1. Export default config `iomesh-values.yaml` from Chart

> **_NOTE_: If you already exported the config, you can skip this step.**

```bash
helm show values iomesh/iomesh > iomesh-values.yaml
```

2. Edit `iomesh-values.yaml`

```yaml
chunk:
  replicaCount: 2 # scale down the replica count number
  podPolicy: 
    tolerations:
    # ...
```

3. Add taints not in previous `podPolicy.tolerantions` on the node want to scale out.

```yaml
apiVersion: v1
kind: Node
metadata:
  labels:
    iomesh.com/no-chunk: ""
#...
spec:
  taints:
  - effect: NoSchedule
    key: iomesh.com/no-chunk
```

4. Apply the IOMesh Cluster config

> **_NOTE_: `my-iomesh` is release name, maybe you want to modify it.**

```bash
helm upgrade --namespace iomesh-system my-iomesh iomesh/iomesh --values iomesh-values.yaml
```

5. Remove the Chunk Server on the node want to scale out

```
kubectl --namespace iomesh-system get pod -o wide | grep <node-name>
kubectl --namespace iomesh-system delete pod <pod-name>
```

4. Wait chunk server pod be removed.

```bash
watch kubectl get pod --namespace iomesh-system
```

## Upgrade IOMesh storage cluster

IOMesh Storage Cluster keepin release new feature and bugfix.

Follow the step below to upgrade the IOMesh 

> **_NOTE_: If you only have 1 replicas of meta server or chunk server, the upgrade process will never start.**

1. Export default config `iomesh-values.yaml` from Chart

> **_NOTE_: If you already exported the config, you can skip this step.**

```bash
helm show values iomesh/iomesh > iomesh-values.yaml
```

2. Edit `iomesh-values.yaml`

```yaml
# The version of the IOMeshCluster. You get new release from: http://iomesh.com/docs/release/releases
version: v5.0.0-rc5
```

3. Upgrade the IOMesh Cluster

> **_NOTE_: `my-iomesh` is release name, maybe you want to modify it.**

```bash
helm upgrade --namespace iomesh-system my-iomesh iomesh/iomesh --values iomesh-values.yaml
```

4. Wait new chunk server pod ready.

```bash
watch kubectl get pod --namespace iomesh-system
```

## Uninstallation IOMesh storage cluster

> **_/!\ Attention_: Uninstall IOMesh storage cluster will lost all the data stored in IOMesh storage cluster. Including PVCs created with IOMesh StorageClass.**

Uninstallation IOMesh storage cluster

> **_NOTE_: `my-iomesh` is release name, maybe you want to modify it.**

```bash
helm uninstall --namespace iomesh-system my-iomesh
```

[1]: http://www.iomesh.com/docs/installation/setup-iomesh-storage#mount-device