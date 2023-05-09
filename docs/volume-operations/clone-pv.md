---
id: clone-pv
title: Clone PV
sidebar_label: Clone PV
---

To clone a PV, you should create a new PVC and specify an existing PVC in the field `dataSource` so that you can clone a volume based on it.

**Precautions**
- The target PVC must be in the same namespace as the source PVC.
- The target PVC must have the same StorageClass and volume mode as the source PVC.
- The capacity of the target PVC must match the capacity of the source PVC.

**Prerequisite**

Verify that there is already a PVC available for cloning.

**Procedure**
1. Create a YAML config `clone.yaml`. Specify the source PVC in the field `name`.

    ```yaml
    # Source: clone.yaml
    apiVersion: v1
    kind: PersistentVolumeClaim
    metadata:
      name: cloned-pvc
    spec:
      storageClassName: iomesh-csi-driver # The StorageClass must be the same as that of the source PVC.
      dataSource:
        name: iomesh-example-pvc # Specify the source PVC that should be from the same namespace as the target PVC. 
        kind: PersistentVolumeClaim
      accessModes:
        - ReadWriteOnce
      resources:
        requests:
          storage: 10Gi # The capacity value must be the same as that of the source PVC.
      volumeMode: Filesystem # The volume mode must be the same as that of the source PVC.
    ```

2. Apply the YAML config. Once done, a clone of `existing-pvc` will be created.

    ```bash
    kubectl apply -f clone.yaml
    ``` 
   
3. Check the new PVC.

    ```
    kubectl get pvc cloned-pvc
    ```
   If successful, you should see output below:
    ```output
    NAME         STATUS   VOLUME                                     CAPACITY   ACCESS MODES   STORAGECLASS        AGE
    cloned-pvc   Bound    pvc-161b8c15-3b9f-4742-95db-dcd69c9a2931   10Gi       RWO            iomesh-csi-driver   12s 
    ```
4. Get the cloned PV.
    ```shell
    kubectl get pv pvc-161b8c15-3b9f-4742-95db-dcd69c9a2931 # The PV name you get in Step 3.
    ```

    If successful, you should see output below:
    ```output
    NAME                                       CAPACITY   ACCESS MODES   RECLAIM POLICY   STATUS   CLAIM                STORAGECLASS        REASON   AGE
    pvc-161b8c15-3b9f-4742-95db-dcd69c9a2931   10Gi       RWO            Delete           Bound    default/cloned-pvc   iomesh-csi-driver            122m
    ```